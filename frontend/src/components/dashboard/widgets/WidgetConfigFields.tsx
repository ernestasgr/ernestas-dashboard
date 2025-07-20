'use client';

import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTestObsidianConnectionMutation } from '@/generated/Notes.generated';
import {
    validateWidgetConfig,
    WidgetType,
} from '@/lib/validation/widget-schemas';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface WidgetConfigFieldsProps {
    type: string;
    config: Record<string, unknown>;
    onConfigUpdate: (field: string, value: unknown) => void;
    onValidationChange?: (hasErrors: boolean) => void;
}

export function WidgetConfigFields({
    type,
    config,
    onConfigUpdate,
    onValidationChange,
}: WidgetConfigFieldsProps) {
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [testObsidianConnectionMutation] =
        useTestObsidianConnectionMutation();

    useEffect(() => {
        const validation = validateWidgetConfig(type as WidgetType, config);
        if (validation.success) {
            setValidationErrors([]);
            onValidationChange?.(false);
        } else {
            setValidationErrors(validation.errors);
            onValidationChange?.(true);
        }
    }, [config, type, onValidationChange]);

    const testObsidianConnection = async (apiUrl: string, authKey: string) => {
        if (!apiUrl || !authKey) {
            toast.error('API URL and Auth Key are required');
            return;
        }

        setIsTestingConnection(true);
        try {
            const input = {
                apiUrl,
                authKey,
            };

            const result = await testObsidianConnectionMutation({
                variables: { input },
            });

            if (result.data?.testObsidianConnection) {
                toast.success(
                    'Connection successful! Obsidian API is working.',
                );
            } else {
                toast.error(
                    'Connection failed: Unable to connect to Obsidian API',
                );
            }
        } catch (error) {
            console.error('Connection test failed:', error);
            toast.error(
                `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        } finally {
            setIsTestingConnection(false);
        }
    };
    const renderClockConfig = () => {
        const clockConfig = config as {
            timezone?: string;
            format?: string;
        };

        const timezoneError =
            !clockConfig.timezone || clockConfig.timezone.trim() === '';

        return (
            <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                    <Label htmlFor='timezone'>Timezone</Label>
                    <Input
                        id='timezone'
                        value={clockConfig.timezone ?? 'UTC'}
                        onChange={(e) => {
                            onConfigUpdate('timezone', e.target.value);
                        }}
                        placeholder='UTC'
                        className={timezoneError ? 'border-red-500' : ''}
                    />
                    {timezoneError && (
                        <p className='text-sm text-red-600'>
                            Timezone is required
                        </p>
                    )}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='format'>Format</Label>
                    <Select
                        value={clockConfig.format ?? '24h'}
                        onValueChange={(value) => {
                            onConfigUpdate('format', value);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='12h'>12 Hour</SelectItem>
                            <SelectItem value='24h'>24 Hour</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    };
    const renderWeatherConfig = () => {
        const weatherConfig = config as {
            location?: string;
            units?: string;
        };

        const locationError =
            !weatherConfig.location || weatherConfig.location.trim() === '';

        return (
            <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                    <Label htmlFor='location'>Location</Label>
                    <Input
                        id='location'
                        value={weatherConfig.location ?? ''}
                        onChange={(e) => {
                            onConfigUpdate('location', e.target.value);
                        }}
                        placeholder='New York, NY'
                        className={locationError ? 'border-red-500' : ''}
                    />
                    {locationError && (
                        <p className='text-sm text-red-600'>
                            Location is required
                        </p>
                    )}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='units'>Units</Label>
                    <Select
                        value={weatherConfig.units ?? 'metric'}
                        onValueChange={(value) => {
                            onConfigUpdate('units', value);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='metric'>Celsius</SelectItem>
                            <SelectItem value='imperial'>Fahrenheit</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    };
    const renderNotesConfig = () => {
        const notesConfig = config as {
            maxLength?: number;
            visibleLabels?: string[];
            showGrid?: boolean;
            gridColumns?: number;
            obsidianApiUrl?: string;
            obsidianAuthKey?: string;
            obsidianVaultName?: string;
            enableObsidianSync?: boolean;
        };

        return (
            <>
                <div className='space-y-2'>
                    <Label htmlFor='maxLength'>Max Length per Note</Label>
                    <Input
                        id='maxLength'
                        type='number'
                        value={notesConfig.maxLength ?? 500}
                        onChange={(e) => {
                            onConfigUpdate(
                                'maxLength',
                                parseInt(e.target.value) || 500,
                            );
                        }}
                        min={1}
                        max={2000}
                    />
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='visibleLabels'>
                        Visible Labels (comma-separated, leave empty for all)
                    </Label>
                    <Input
                        id='visibleLabels'
                        value={
                            Array.isArray(notesConfig.visibleLabels)
                                ? notesConfig.visibleLabels.join(', ')
                                : ''
                        }
                        onChange={(e) => {
                            const labels = e.target.value
                                .split(',')
                                .map((l) => l.trim())
                                .filter((l) => l);
                            onConfigUpdate(
                                'visibleLabels',
                                labels.length > 0 ? labels : undefined,
                            );
                        }}
                        placeholder='work, personal, important'
                    />
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='showGrid'>Show as Grid</Label>
                    <Select
                        value={notesConfig.showGrid ? 'true' : 'false'}
                        onValueChange={(value) => {
                            onConfigUpdate('showGrid', value === 'true');
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='true'>Grid Layout</SelectItem>
                            <SelectItem value='false'>List Layout</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {notesConfig.showGrid && (
                    <div className='space-y-2'>
                        <Label htmlFor='gridColumns'>Grid Columns</Label>
                        <Input
                            id='gridColumns'
                            type='number'
                            value={notesConfig.gridColumns ?? 3}
                            onChange={(e) => {
                                onConfigUpdate(
                                    'gridColumns',
                                    parseInt(e.target.value) || 3,
                                );
                            }}
                            min={1}
                        />
                    </div>
                )}

                {/* Obsidian Integration Section */}
                <div className='mt-4 border-t pt-4'>
                    <h3 className='mb-3 text-sm font-medium'>
                        Obsidian Integration
                    </h3>
                    <div className='space-y-2'>
                        <Label htmlFor='enableObsidianSync'>
                            Enable Obsidian Sync
                        </Label>
                        <Select
                            value={
                                notesConfig.enableObsidianSync
                                    ? 'true'
                                    : 'false'
                            }
                            onValueChange={(value) => {
                                onConfigUpdate(
                                    'enableObsidianSync',
                                    value === 'true',
                                );
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='false'>Disabled</SelectItem>
                                <SelectItem value='true'>Enabled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {notesConfig.enableObsidianSync && (
                        <>
                            <div className='space-y-2'>
                                <Label htmlFor='obsidianApiUrl'>
                                    Obsidian Local REST API URL
                                </Label>
                                <Input
                                    id='obsidianApiUrl'
                                    value={notesConfig.obsidianApiUrl ?? ''}
                                    onChange={(e) => {
                                        onConfigUpdate(
                                            'obsidianApiUrl',
                                            e.target.value || undefined,
                                        );
                                    }}
                                    placeholder='http://localhost:27123'
                                />
                                <p className='text-xs text-gray-500'>
                                    Make sure the Obsidian Local REST API plugin
                                    is installed and running
                                </p>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='obsidianAuthKey'>
                                    Authorization Key
                                </Label>
                                <Input
                                    id='obsidianAuthKey'
                                    type='password'
                                    value={notesConfig.obsidianAuthKey ?? ''}
                                    onChange={(e) => {
                                        onConfigUpdate(
                                            'obsidianAuthKey',
                                            e.target.value || undefined,
                                        );
                                    }}
                                    placeholder='Enter your API key'
                                />
                                <p className='text-xs text-gray-500'>
                                    Found in Obsidian → Settings → Local REST
                                    API → API Key
                                </p>
                            </div>

                            <div className='flex justify-end'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={() => {
                                        void testObsidianConnection(
                                            notesConfig.obsidianApiUrl ?? '',
                                            notesConfig.obsidianAuthKey ?? '',
                                        );
                                    }}
                                    disabled={
                                        isTestingConnection ||
                                        !notesConfig.obsidianApiUrl ||
                                        !notesConfig.obsidianAuthKey
                                    }
                                    className='gap-2'
                                >
                                    {isTestingConnection ? (
                                        <>
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className='h-4 w-4' />
                                            Test Connection
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='obsidianVaultName'>
                                    Vault Name (Optional)
                                </Label>
                                <Input
                                    id='obsidianVaultName'
                                    value={notesConfig.obsidianVaultName ?? ''}
                                    onChange={(e) => {
                                        onConfigUpdate(
                                            'obsidianVaultName',
                                            e.target.value || undefined,
                                        );
                                    }}
                                    placeholder='My Vault'
                                />
                                <p className='text-xs text-gray-500'>
                                    Leave empty to use the default vault
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </>
        );
    };
    const renderTasksConfig = () => {
        const tasksConfig = config as {
            categories?: string[];
            defaultCategory?: string;
        };

        const categoriesError =
            !tasksConfig.categories || tasksConfig.categories.length === 0;

        return (
            <>
                <div className='space-y-2'>
                    <Label htmlFor='categories'>
                        Categories (comma-separated)
                    </Label>
                    <Input
                        id='categories'
                        value={tasksConfig.categories?.join(', ') ?? ''}
                        onChange={(e) => {
                            onConfigUpdate(
                                'categories',
                                e.target.value
                                    .split(',')
                                    .map((c) => c.trim())
                                    .filter((c) => c),
                            );
                        }}
                        placeholder='personal, work, urgent'
                        className={categoriesError ? 'border-red-500' : ''}
                    />
                    {categoriesError && (
                        <p className='text-sm text-red-600'>
                            At least one category is required
                        </p>
                    )}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='defaultCategory'>Default Category</Label>
                    <Input
                        id='defaultCategory'
                        value={tasksConfig.defaultCategory ?? ''}
                        onChange={(e) => {
                            onConfigUpdate('defaultCategory', e.target.value);
                        }}
                        placeholder='personal'
                    />
                </div>
            </>
        );
    };
    switch (type) {
        case 'clock':
            return (
                <>
                    {renderClockConfig()}
                    <ErrorDisplay errors={validationErrors} />
                </>
            );
        case 'weather':
            return (
                <>
                    {renderWeatherConfig()}
                    <ErrorDisplay errors={validationErrors} />
                </>
            );
        case 'notes':
            return (
                <>
                    {renderNotesConfig()}
                    <ErrorDisplay errors={validationErrors} />
                </>
            );
        case 'tasks':
            return (
                <>
                    {renderTasksConfig()}
                    <ErrorDisplay errors={validationErrors} />
                </>
            );
        default:
            return null;
    }
}
