import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { WidgetService } from './widget.service';
import {
    CreateWidgetInput,
    UpdateWidgetInput,
    UpdateWidgetLayoutInput,
    Widget,
} from './widget.types';

describe('WidgetService', () => {
    let service: WidgetService;
    let prismaService: any;
    let loggerService: jest.Mocked<LoggerService>;

    const mockUserId = 'user-123';
    const mockWidgetId = 'widget-456';

    const mockDbWidget = {
        id: mockWidgetId,
        userId: mockUserId,
        type: 'clock',
        title: 'Test Clock',
        config: { timezone: 'UTC', format: '24h' },
        x: 0,
        y: 0,
        width: 3,
        height: 4,
        backgroundColor: '#ffffff',
        textColor: 'oklch(80.9% 0.105 251.813)',
        iconColor: 'oklch(42.4% 0.199 265.638 / 0.5)',
        backgroundImage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockWidget: Widget = {
        id: mockWidgetId,
        type: 'clock',
        title: 'Test Clock',
        config: { timezone: 'UTC', format: '24h' },
        x: 0,
        y: 0,
        width: 3,
        height: 4,
        backgroundColor: '#ffffff',
        textColor: 'oklch(80.9% 0.105 251.813)',
        iconColor: 'oklch(42.4% 0.199 265.638 / 0.5)',
        backgroundImage: undefined,
    };

    const mockPrismaService = {
        userWidget: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    } as any;

    const mockLoggerService = {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WidgetService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: LoggerService,
                    useValue: mockLoggerService,
                },
            ],
        }).compile();

        service = module.get<WidgetService>(WidgetService);
        prismaService = module.get(PrismaService);
        loggerService = module.get(LoggerService);

        jest.clearAllMocks();
    });

    describe('getWidgetsForUser', () => {
        it('should return all widgets for a user', async () => {
            const mockWidgets = [mockDbWidget];
            prismaService.userWidget.findMany.mockResolvedValue(mockWidgets);

            const result = await service.getWidgetsForUser(mockUserId);

            expect(prismaService.userWidget.findMany).toHaveBeenCalledWith({
                where: { userId: mockUserId },
                orderBy: { createdAt: 'asc' },
            });
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockWidget);
        });

        it('should return empty array when user has no widgets', async () => {
            prismaService.userWidget.findMany.mockResolvedValue([]);

            const result = await service.getWidgetsForUser(mockUserId);

            expect(result).toEqual([]);
        });
    });

    describe('getWidgetById', () => {
        it('should return a widget when found', async () => {
            prismaService.userWidget.findUnique.mockResolvedValue(mockDbWidget);

            const result = await service.getWidgetById(mockWidgetId);

            expect(prismaService.userWidget.findUnique).toHaveBeenCalledWith({
                where: { id: mockWidgetId },
            });
            expect(result).toEqual(mockWidget);
        });

        it('should return null when widget not found', async () => {
            prismaService.userWidget.findUnique.mockResolvedValue(null);

            const result = await service.getWidgetById('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('createWidget', () => {
        const createInput: CreateWidgetInput = {
            type: 'clock',
            title: 'New Clock',
            config: { timezone: 'UTC', format: '24h' },
            x: 1,
            y: 1,
            width: 2,
            height: 3,
            backgroundColor: '#000000',
            textColor: '#ffffff',
            iconColor: '#cccccc',
            backgroundImage: 'image.png',
        };

        it('should create a new widget with all provided fields', async () => {
            const expectedDbData = {
                userId: mockUserId,
                type: createInput.type,
                title: createInput.title,
                config: createInput.config,
                x: createInput.x,
                y: createInput.y,
                width: createInput.width,
                height: createInput.height,
                backgroundColor: createInput.backgroundColor,
                textColor: createInput.textColor,
                iconColor: createInput.iconColor,
                backgroundImage: createInput.backgroundImage,
            };

            const createdWidget = { ...mockDbWidget, ...expectedDbData };
            prismaService.userWidget.create.mockResolvedValue(createdWidget);

            const result = await service.createWidget(mockUserId, createInput);

            expect(prismaService.userWidget.create).toHaveBeenCalledWith({
                data: expectedDbData,
            });
            expect(result.type).toBe(createInput.type);
            expect(result.title).toBe(createInput.title);
        });

        it('should use default colors when not provided', async () => {
            const inputWithoutColors: CreateWidgetInput = {
                type: 'weather',
                x: 0,
                y: 0,
                width: 3,
                height: 4,
            };

            const expectedDbData = {
                userId: mockUserId,
                type: inputWithoutColors.type,
                title: undefined,
                config: undefined,
                x: inputWithoutColors.x,
                y: inputWithoutColors.y,
                width: inputWithoutColors.width,
                height: inputWithoutColors.height,
                backgroundColor: undefined,
                textColor: 'oklch(79.2% 0.209 151.711)',
                iconColor: 'oklch(44.8% 0.119 151.328 / 0.5)',
                backgroundImage: undefined,
            };

            const createdWidget = { ...mockDbWidget, ...expectedDbData };
            prismaService.userWidget.create.mockResolvedValue(createdWidget);

            await service.createWidget(mockUserId, inputWithoutColors);

            expect(prismaService.userWidget.create).toHaveBeenCalledWith({
                data: expectedDbData,
            });
        });
    });

    describe('updateWidget', () => {
        const updateInput: UpdateWidgetInput = {
            id: mockWidgetId,
            title: 'Updated Title',
            config: { timezone: 'America/New_York', format: '12h' },
            backgroundColor: '#ff0000',
            textColor: '#00ff00',
            iconColor: '#0000ff',
        };

        it('should update widget with provided fields', async () => {
            prismaService.userWidget.findUnique.mockResolvedValue(mockDbWidget);
            const updatedWidget = { ...mockDbWidget, ...updateInput };
            prismaService.userWidget.update.mockResolvedValue(updatedWidget);

            const result = await service.updateWidget(updateInput);

            expect(prismaService.userWidget.findUnique).toHaveBeenCalledWith({
                where: { id: mockWidgetId },
            });

            expect(prismaService.userWidget.update).toHaveBeenCalledWith({
                where: { id: mockWidgetId },
                data: {
                    title: updateInput.title,
                    config: updateInput.config,
                    backgroundColor: updateInput.backgroundColor,
                    textColor: updateInput.textColor,
                    iconColor: updateInput.iconColor,
                },
            });

            expect(result.title).toBe(updateInput.title);
        });

        it('should use default colors when colors are not provided', async () => {
            const inputWithoutColors: UpdateWidgetInput = {
                id: mockWidgetId,
                title: 'Updated Title',
            };

            prismaService.userWidget.findUnique.mockResolvedValue(mockDbWidget);
            const updatedWidget = { ...mockDbWidget, ...inputWithoutColors };
            prismaService.userWidget.update.mockResolvedValue(updatedWidget);

            await service.updateWidget(inputWithoutColors);

            expect(prismaService.userWidget.update).toHaveBeenCalledWith({
                where: { id: mockWidgetId },
                data: {
                    title: inputWithoutColors.title,
                    textColor: 'oklch(80.9% 0.105 251.813)',
                    iconColor: 'oklch(42.4% 0.199 265.638 / 0.5)',
                },
            });
        });

        it('should throw error when widget not found', async () => {
            prismaService.userWidget.findUnique.mockResolvedValue(null);

            await expect(service.updateWidget(updateInput)).rejects.toThrow(
                `Widget with ID ${mockWidgetId} not found`,
            );
        });

        it('should log input and widget type', async () => {
            prismaService.userWidget.findUnique.mockResolvedValue(mockDbWidget);
            const updatedWidget = { ...mockDbWidget, ...updateInput };
            prismaService.userWidget.update.mockResolvedValue(updatedWidget);

            await service.updateWidget(updateInput);

            expect(loggerService.log).toHaveBeenCalledWith(
                JSON.stringify(updateInput),
            );
            expect(loggerService.log).toHaveBeenCalledWith('clock');
        });
    });

    describe('updateWidgetLayout', () => {
        const layoutInput: UpdateWidgetLayoutInput = {
            id: mockWidgetId,
            x: 5,
            y: 10,
            width: 4,
            height: 6,
        };

        it('should update widget layout', async () => {
            const updatedWidget = { ...mockDbWidget, ...layoutInput };
            prismaService.userWidget.update.mockResolvedValue(updatedWidget);

            const result = await service.updateWidgetLayout(layoutInput);

            expect(prismaService.userWidget.update).toHaveBeenCalledWith({
                where: { id: mockWidgetId },
                data: {
                    x: layoutInput.x,
                    y: layoutInput.y,
                    width: layoutInput.width,
                    height: layoutInput.height,
                },
            });

            expect(result.x).toBe(layoutInput.x);
            expect(result.y).toBe(layoutInput.y);
            expect(result.width).toBe(layoutInput.width);
            expect(result.height).toBe(layoutInput.height);
        });
    });

    describe('deleteWidget', () => {
        it('should delete widget and return true on success', async () => {
            prismaService.userWidget.delete.mockResolvedValue(mockDbWidget);

            const result = await service.deleteWidget(mockWidgetId);

            expect(prismaService.userWidget.delete).toHaveBeenCalledWith({
                where: { id: mockWidgetId },
            });
            expect(result).toBe(true);
        });

        it('should return false when delete fails', async () => {
            prismaService.userWidget.delete.mockRejectedValue(
                new Error('Not found'),
            );

            const result = await service.deleteWidget('non-existent');

            expect(result).toBe(false);
        });
    });

    describe('getWidgetsByType', () => {
        it('should return widgets of specified type', async () => {
            const widgets = [mockDbWidget];
            prismaService.userWidget.findMany.mockResolvedValue(widgets);

            const result = await service.getWidgetsByType('clock');

            expect(prismaService.userWidget.findMany).toHaveBeenCalledWith({
                where: { type: 'clock' },
            });
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe('clock');
        });
    });

    describe('getAvailableWidgetTypes', () => {
        it('should return distinct widget types', async () => {
            const typeResults = [
                { type: 'clock' },
                { type: 'weather' },
                { type: 'notes' },
            ];
            prismaService.userWidget.findMany.mockResolvedValue(typeResults);

            const result = await service.getAvailableWidgetTypes();

            expect(prismaService.userWidget.findMany).toHaveBeenCalledWith({
                select: { type: true },
                distinct: ['type'],
            });
            expect(result).toEqual(['clock', 'weather', 'notes']);
        });
    });

    describe('seedUserWidgets', () => {
        it('should return existing widgets if user already has some', async () => {
            const existingWidgets = [mockDbWidget];
            prismaService.userWidget.findMany
                .mockResolvedValueOnce(existingWidgets) // for check
                .mockResolvedValueOnce(existingWidgets); // for getWidgetsForUser

            const result = await service.seedUserWidgets(mockUserId);

            expect(result).toHaveLength(1);
            expect(prismaService.userWidget.create).not.toHaveBeenCalled();
        });

        it('should create default widgets for new user', async () => {
            prismaService.userWidget.findMany.mockResolvedValueOnce([]);

            const defaultWidgets = [
                { ...mockDbWidget, type: 'clock', title: 'World Clock' },
                { ...mockDbWidget, type: 'weather', title: 'Current Weather' },
                { ...mockDbWidget, type: 'notes', title: 'Quick Notes' },
                { ...mockDbWidget, type: 'tasks', title: 'Todo List' },
            ];

            prismaService.userWidget.create
                .mockResolvedValueOnce(defaultWidgets[0])
                .mockResolvedValueOnce(defaultWidgets[1])
                .mockResolvedValueOnce(defaultWidgets[2])
                .mockResolvedValueOnce(defaultWidgets[3]);

            const result = await service.seedUserWidgets(mockUserId);

            expect(prismaService.userWidget.create).toHaveBeenCalledTimes(4);
            expect(result).toHaveLength(4);

            const types = result.map((w) => w.type);
            expect(types).toContain('clock');
            expect(types).toContain('weather');
            expect(types).toContain('notes');
            expect(types).toContain('tasks');
        });
    });

    describe('parseWidgetConfig', () => {
        it('should parse clock config correctly', () => {
            const clockConfig = { timezone: 'UTC', format: '24h' };

            const result = (service as any).parseWidgetConfig(
                'clock',
                clockConfig,
            );
            expect(result).toEqual(clockConfig);
        });

        it('should parse weather config correctly', () => {
            const weatherConfig = { location: 'New York', units: 'metric' };
            const result = (service as any).parseWidgetConfig(
                'weather',
                weatherConfig,
            );
            expect(result).toEqual(weatherConfig);
        });

        it('should parse notes config correctly', () => {
            const notesConfig = { content: 'Test note', maxLength: 500 };
            const result = (service as any).parseWidgetConfig(
                'notes',
                notesConfig,
            );
            expect(result).toEqual(notesConfig);
        });

        it('should parse tasks config correctly', () => {
            const tasksConfig = {
                categories: ['work', 'personal'],
                defaultCategory: 'work',
            };
            const result = (service as any).parseWidgetConfig(
                'tasks',
                tasksConfig,
            );
            expect(result).toEqual(tasksConfig);
        });

        it('should return undefined for unknown type', () => {
            const result = (service as any).parseWidgetConfig('unknown', {});
            expect(result).toBeUndefined();
        });

        it('should return undefined for null config', () => {
            const result = (service as any).parseWidgetConfig('clock', null);
            expect(result).toBeUndefined();
        });
    });

    describe('mapToWidget', () => {
        it('should map database widget to domain widget correctly', () => {
            const result = (service as any).mapToWidget(mockDbWidget);
            expect(result).toEqual(mockWidget);
        });

        it('should handle null values correctly', () => {
            const dbWidgetWithNulls = {
                ...mockDbWidget,
                title: null,
                backgroundColor: null,
                textColor: null,
                iconColor: null,
                backgroundImage: null,
            };

            const result = (service as any).mapToWidget(dbWidgetWithNulls);

            expect(result.title).toBeUndefined();
            expect(result.backgroundColor).toBeUndefined();
            expect(result.textColor).toBeUndefined();
            expect(result.iconColor).toBeUndefined();
            expect(result.backgroundImage).toBeUndefined();
        });
    });
});
