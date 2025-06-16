import { Injectable } from '@nestjs/common';
import {
    ClockConfig,
    NotesConfig,
    TasksConfig,
    WeatherConfig,
    Widget,
} from './widget.types';

@Injectable()
export class WidgetService {
    private readonly widgets: Widget[] = [
        {
            id: 'clock-1',
            type: 'clock',
            title: 'World Clock',
            config: {
                timezone: 'UTC',
                format: '24h',
            } as ClockConfig,
        },
        {
            id: 'weather-1',
            type: 'weather',
            title: 'Current Weather',
            config: {
                location: 'New York, NY',
                units: 'metric',
            } as WeatherConfig,
        },
        {
            id: 'notes-1',
            type: 'notes',
            title: 'Quick Notes',
            config: {
                content: 'Remember to check the dashboard layout',
                maxLength: 500,
            } as NotesConfig,
        },
        {
            id: 'tasks-1',
            type: 'tasks',
            title: 'Todo List',
            config: {
                categories: ['personal', 'work', 'urgent'],
                defaultCategory: 'personal',
            } as TasksConfig,
        },
        {
            id: 'clock-2',
            type: 'clock',
            title: 'Local Time',
            config: {
                timezone: 'America/New_York',
                format: '12h',
            } as ClockConfig,
        },
        {
            id: 'weather-2',
            type: 'weather',
            title: 'London Weather',
            config: {
                location: 'London, UK',
                units: 'metric',
            } as WeatherConfig,
        },
    ];

    /**
     * Get all widgets for a specific user
     * For now, returns the same hardcoded widgets for all users
     */
    async getWidgetsForUser(userId: string): Promise<Widget[]> {
        // In a real implementation, this would filter by user permissions
        // and return user-specific configurations
        return this.widgets;
    }

    /**
     * Get a specific widget by ID
     */
    async getWidgetById(id: string): Promise<Widget | null> {
        return this.widgets.find((widget) => widget.id === id) || null;
    }

    /**
     * Get widgets by type
     */
    async getWidgetsByType(type: string): Promise<Widget[]> {
        return this.widgets.filter((widget) => widget.type === type);
    }

    /**
     * Get all available widget types
     */
    async getAvailableWidgetTypes(): Promise<string[]> {
        const types = new Set(this.widgets.map((widget) => widget.type));
        return Array.from(types);
    }
}
