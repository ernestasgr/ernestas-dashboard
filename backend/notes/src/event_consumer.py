"""Kafka event consumer for handling events in the notes service."""

import asyncio
import json
import os
import threading
from typing import Any, Dict

from confluent_kafka import Consumer, KafkaError, KafkaException

from .logger import logger
from .service import NoteService


class EventConsumer:
    """Kafka event consumer for processing events related to notes."""

    def __init__(self, main_loop: asyncio.AbstractEventLoop | None = None):
        """Initialize the event consumer."""
        self.kafka_brokers = os.getenv("KAFKA_BROKERS", "localhost:9094")
        self.consumer_group = "notes-service"
        self.topics = ["widget-deleted"]
        self.main_loop = main_loop or asyncio.get_event_loop()

        self.consumer_config: Dict[str, Any] = {
            "bootstrap.servers": self.kafka_brokers,
            "group.id": self.consumer_group,
            "auto.offset.reset": "latest",
            "enable.auto.commit": True,
            "auto.commit.interval.ms": 1000,
            "session.timeout.ms": 30000,
            "heartbeat.interval.ms": 10000,
        }

        self.consumer = None
        self.consumer_thread = None
        self.running = False
        self.note_service = NoteService()

    def start_consumer(self):
        """Start the Kafka consumer in a separate thread."""
        if self.running:
            logger.warning("Consumer is already running")
            return

        self.running = True
        self.consumer_thread = threading.Thread(
            target=self._consume_messages, daemon=True
        )
        self.consumer_thread.start()
        logger.info(f"Started Kafka consumer for topics: {self.topics}")

    def stop_consumer(self):
        """Stop the Kafka consumer."""
        if not self.running:
            return

        self.running = False

        if self.consumer:
            self.consumer.close()

        if self.consumer_thread and self.consumer_thread.is_alive():
            self.consumer_thread.join(timeout=5)

        logger.info("Kafka consumer stopped")

    def _consume_messages(self):
        """Main consumer loop running in a separate thread."""
        try:
            self.consumer = Consumer(self.consumer_config)
            self.consumer.subscribe(self.topics)

            logger.info(f"Consumer subscribed to topics: {self.topics}")
            logger.info(f"Consumer configuration: {self.consumer_config}")

            while self.running:
                try:
                    msg = self.consumer.poll(timeout=1.0)

                    if msg is None:
                        continue

                    if msg.error():
                        error = msg.error()
                        if error and error.code() == KafkaError._PARTITION_EOF:
                            logger.debug(f"Reached end of partition {msg.partition()}")
                            continue
                        else:
                            logger.error(f"Consumer error: {error}")
                            continue

                    self._process_message_sync(msg)

                except KafkaException as e:
                    logger.error(f"Kafka exception in consumer loop: {e}")
                except Exception as e:
                    logger.error(f"Unexpected error in consumer loop: {e}")

        except Exception as e:
            logger.error(f"Failed to start Kafka consumer: {e}")
        finally:
            if self.consumer:
                self.consumer.close()

    def _process_message_sync(self, msg: Any) -> None:
        """Process a Kafka message synchronously."""
        try:
            topic = msg.topic()
            value = msg.value()

            if value is None:
                logger.warning(f"Received empty message from topic {topic}")
                return

            try:
                message_str = value.decode("utf-8")
                event_data = json.loads(message_str)
            except (UnicodeDecodeError, json.JSONDecodeError) as e:
                logger.error(f"Failed to decode/parse message from topic {topic}: {e}")
                return

            logger.debug(f"Received message from topic {topic}: {event_data}")

            if topic == "widget-deleted":
                # Schedule the async handler to run on the main event loop
                future = asyncio.run_coroutine_threadsafe(
                    self._handle_widget_deleted_event(event_data), self.main_loop
                )
                # Wait for the result (with timeout to avoid hanging)
                try:
                    future.result(timeout=30)
                except Exception as e:
                    logger.error(f"Error waiting for async handler result: {e}")
            else:
                logger.warning(f"No handler for topic: {topic}")

        except Exception as e:
            logger.error(f"Error processing message: {e}")
            logger.error(f"Message topic: {msg.topic()}, value: {msg.value()}")

    async def _handle_widget_deleted_event(self, event_data: Dict[str, Any]):
        """Handle widget deletion event."""
        try:
            widget_id = event_data.get("widgetId")
            widget_type = event_data.get("widgetType")

            if not widget_id or not widget_type:
                logger.warning(
                    f"Invalid widget deletion event: missing widgetId or widgetType. Event: {event_data}"
                )
                return

            logger.info(
                f"Received widget deletion event for widget {widget_id} of type {widget_type}"
            )

            if widget_type == "notes":
                deleted_count = await self.note_service.delete_notes_by_widget(
                    widget_id
                )
                logger.info(f"Deleted {deleted_count} notes for widget {widget_id}")
            else:
                logger.debug(
                    f"Ignoring widget deletion event for non-notes widget: {widget_type}"
                )

        except Exception as e:
            logger.error(f"Error handling widget deletion event: {e}")
            logger.error(f"Event data: {event_data}")
