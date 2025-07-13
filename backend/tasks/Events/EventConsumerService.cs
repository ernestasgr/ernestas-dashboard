using System.Text.Json;
using Confluent.Kafka;
using Tasks.Services;

namespace Tasks.Events;

/// <summary>
/// Event data for widget deletion.
/// </summary>
public class WidgetDeletedEvent
{
    public string WidgetId { get; set; } = string.Empty;
    public string WidgetType { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty;
}

/// <summary>
/// Kafka event consumer for handling widget deletion events.
/// </summary>
public class EventConsumerService : IHostedService
{
    private readonly ILogger<EventConsumerService> _logger;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly string _kafkaBrokers;
    private readonly CancellationTokenSource _cancellationTokenSource;
    private Task? _consumerTask;

    public EventConsumerService(
        ILogger<EventConsumerService> logger,
        IServiceScopeFactory serviceScopeFactory,
        IConfiguration configuration)
    {
        _logger = logger;
        _serviceScopeFactory = serviceScopeFactory;
        _kafkaBrokers = configuration.GetValue<string>("KAFKA_BROKERS") ?? "event-bus:9092";
        _cancellationTokenSource = new CancellationTokenSource();
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting Kafka event consumer service");

        _consumerTask = Task.Run(async () => await ConsumeEvents(_cancellationTokenSource.Token), cancellationToken);

        return Task.CompletedTask;
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Stopping Kafka event consumer service");

        _cancellationTokenSource.Cancel();

        if (_consumerTask != null)
        {
            await _consumerTask;
        }
    }

    private async Task ConsumeEvents(CancellationToken cancellationToken)
    {
        var config = new ConsumerConfig
        {
            BootstrapServers = _kafkaBrokers,
            GroupId = "tasks-service",
            AutoOffsetReset = AutoOffsetReset.Latest,
            EnableAutoCommit = true
        };

        using var consumer = new ConsumerBuilder<string, string>(config).Build();

        try
        {
            consumer.Subscribe("widget-deleted");
            _logger.LogInformation("Subscribed to widget-deleted topic");

            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    var consumeResult = consumer.Consume(cancellationToken);
                    await HandleWidgetDeletedEvent(consumeResult.Message.Value);
                }
                catch (ConsumeException ex)
                {
                    _logger.LogError(ex, "Error consuming message from Kafka");
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Consumer operation was cancelled");
                    break;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in Kafka consumer");
        }
        finally
        {
            consumer.Close();
            _logger.LogInformation("Kafka consumer closed");
        }
    }

    private async Task HandleWidgetDeletedEvent(string eventJson)
    {
        try
        {
            var eventData = JsonSerializer.Deserialize<WidgetDeletedEvent>(eventJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (eventData == null)
            {
                _logger.LogWarning("Failed to deserialize widget deletion event: {EventJson}", eventJson);
                return;
            }

            _logger.LogInformation("Received widget deletion event for widget {WidgetId} of type {WidgetType}",
                eventData.WidgetId, eventData.WidgetType);

            if (eventData.WidgetType == "tasks")
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var taskService = scope.ServiceProvider.GetRequiredService<ITaskService>();

                var deletedCount = await taskService.DeleteTasksByWidgetAsync(eventData.WidgetId);
                _logger.LogInformation("Deleted {TaskCount} tasks for widget {WidgetId}",
                    deletedCount, eventData.WidgetId);
            }
            else
            {
                _logger.LogDebug("Ignoring widget deletion event for non-tasks widget: {WidgetType}",
                    eventData.WidgetType);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling widget deletion event: {EventJson}", eventJson);
        }
    }
}
