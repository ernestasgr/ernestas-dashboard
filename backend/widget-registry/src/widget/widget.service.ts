import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    ClockConfig,
    CreateWidgetInput,
    NotesConfig,
    TasksConfig,
    UpdateWidgetInput,
    UpdateWidgetLayoutInput,
    WeatherConfig,
    Widget,
} from './widget.types';

@Injectable()
export class WidgetService {
    constructor(private prisma: PrismaService) {}

    /**
     * Helper method to parse widget config based on type
     */
    private parseWidgetConfig(
        type: string,
        config: any,
    ): ClockConfig | WeatherConfig | NotesConfig | TasksConfig | undefined {
        if (!config) return undefined;

        switch (type) {
            case 'clock':
                return config as unknown as ClockConfig;
            case 'weather':
                return config as unknown as WeatherConfig;
            case 'notes':
                return config as unknown as NotesConfig;
            case 'tasks':
                return config as unknown as TasksConfig;
            default:
                return undefined;
        }
    }

    /**
     * Helper method to convert database widget to domain widget
     */
    private mapToWidget(dbWidget: any): Widget {
        return {
            id: dbWidget.id,
            type: dbWidget.type,
            title: dbWidget.title ?? undefined,
            config: this.parseWidgetConfig(dbWidget.type, dbWidget.config),
            x: dbWidget.x,
            y: dbWidget.y,
            width: dbWidget.width,
            height: dbWidget.height,
            backgroundColor: dbWidget.backgroundColor ?? undefined,
            textColor: dbWidget.textColor ?? undefined,
            iconColor: dbWidget.iconColor ?? undefined,
            backgroundImage: dbWidget.backgroundImage ?? undefined,
        };
    }

    /**
     * Get all widgets for a specific user
     */
    async getWidgetsForUser(userId: string): Promise<Widget[]> {
        const userWidgets = await this.prisma.userWidget.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });

        return userWidgets.map((widget) => this.mapToWidget(widget));
    }

    /**
     * Get a specific widget by ID
     */
    async getWidgetById(id: string): Promise<Widget | null> {
        const widget = await this.prisma.userWidget.findUnique({
            where: { id },
        });

        if (!widget) return null;

        return this.mapToWidget(widget);
    }

    /**
     * Create a new widget for a user
     */
    async createWidget(
        userId: string,
        input: CreateWidgetInput,
    ): Promise<Widget> {
        const widget = await this.prisma.userWidget.create({
            data: {
                userId,
                type: input.type,
                title: input.title,
                config: input.config,
                x: input.x,
                y: input.y,
                width: input.width,
                height: input.height,
                backgroundColor: input.backgroundColor,
                textColor: input.textColor,
                iconColor: input.iconColor,
                backgroundImage: input.backgroundImage,
            },
        });

        return this.mapToWidget(widget);
    }

    /**
     * Update a widget
     */
    async updateWidget(input: UpdateWidgetInput): Promise<Widget> {
        const updateData: any = {};

        if (input.title !== undefined) updateData.title = input.title;
        if (input.config !== undefined) updateData.config = input.config;
        if (input.x !== undefined) updateData.x = input.x;
        if (input.y !== undefined) updateData.y = input.y;
        if (input.width !== undefined) updateData.width = input.width;
        if (input.height !== undefined) updateData.height = input.height;
        if (input.backgroundColor !== undefined)
            updateData.backgroundColor = input.backgroundColor;
        if (input.textColor !== undefined)
            updateData.textColor = input.textColor;
        if (input.backgroundImage !== undefined)
            updateData.backgroundImage = input.backgroundImage;
        if (input.iconColor !== undefined)
            updateData.iconColor = input.iconColor;

        const widget = await this.prisma.userWidget.update({
            where: { id: input.id },
            data: updateData,
        });

        return this.mapToWidget(widget);
    }

    /**
     * Update widget layout (position and size)
     */
    async updateWidgetLayout(input: UpdateWidgetLayoutInput): Promise<Widget> {
        const widget = await this.prisma.userWidget.update({
            where: { id: input.id },
            data: {
                x: input.x,
                y: input.y,
                width: input.width,
                height: input.height,
            },
        });

        return this.mapToWidget(widget);
    }

    /**
     * Delete a widget
     */
    async deleteWidget(id: string): Promise<boolean> {
        try {
            await this.prisma.userWidget.delete({
                where: { id },
            });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get widgets by type
     */
    async getWidgetsByType(type: string): Promise<Widget[]> {
        const widgets = await this.prisma.userWidget.findMany({
            where: { type },
        });

        return widgets.map((widget) => this.mapToWidget(widget));
    }

    /**
     * Get all available widget types
     */
    async getAvailableWidgetTypes(): Promise<string[]> {
        const results = await this.prisma.userWidget.findMany({
            select: { type: true },
            distinct: ['type'],
        });

        return results.map((result) => result.type);
    }

    /**
     * Seed initial widgets for a user (for demo purposes)
     */
    async seedUserWidgets(userId: string): Promise<Widget[]> {
        const existingWidgets = await this.prisma.userWidget.findMany({
            where: { userId },
        });

        if (existingWidgets.length > 0) {
            return this.getWidgetsForUser(userId);
        }

        const defaultWidgets = [
            {
                type: 'clock',
                title: 'World Clock',
                config: {
                    timezone: 'UTC',
                    format: '24h',
                } as any,
                x: 0,
                y: 0,
                width: 3,
                height: 4,
            },
            {
                type: 'weather',
                title: 'Current Weather',
                config: {
                    location: 'New York, NY',
                    units: 'metric',
                } as any,
                x: 3,
                y: 0,
                width: 3,
                height: 4,
            },
            {
                type: 'notes',
                title: 'Quick Notes',
                config: {
                    content: 'Remember to check the dashboard layout',
                    maxLength: 500,
                } as any,
                x: 6,
                y: 0,
                width: 3,
                height: 4,
            },
            {
                type: 'tasks',
                title: 'Todo List',
                config: {
                    categories: ['personal', 'work', 'urgent'],
                    defaultCategory: 'personal',
                } as any,
                x: 9,
                y: 0,
                width: 3,
                height: 4,
            },
        ];

        const createdWidgets = await Promise.all(
            defaultWidgets.map((widget) =>
                this.prisma.userWidget.create({
                    data: {
                        userId,
                        ...widget,
                    },
                }),
            ),
        );
        return createdWidgets.map((widget) => this.mapToWidget(widget));
    }
}
