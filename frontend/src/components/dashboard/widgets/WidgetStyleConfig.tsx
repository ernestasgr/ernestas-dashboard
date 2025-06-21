'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Widget, useUpdateWidgetMutation } from '@/generated/graphql';
import {
    WIDGET_BACKGROUND_PRESETS,
    WIDGET_COLOR_PRESETS,
    WIDGET_GRADIENT_PRESETS,
    colorToHex,
    isGradientBackground,
} from '@/lib/utils/widget-styling';
import { Image, Palette, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface WidgetStyleConfigProps {
    widget: Widget;
    onClose: () => void;
}

export const WidgetStyleConfig = ({
    widget,
    onClose,
}: WidgetStyleConfigProps) => {
    const [updateWidget] = useUpdateWidgetMutation();
    const [backgroundColor, setBackgroundColor] = useState(
        widget.backgroundColor ?? '',
    );
    const [textColor, setTextColor] = useState(widget.textColor ?? '');
    const [iconColor, setIconColor] = useState(widget.iconColor ?? '');
    const [backgroundImage, setBackgroundImage] = useState(
        widget.backgroundImage ?? '',
    );
    const handleSave = async () => {
        try {
            await updateWidget({
                variables: {
                    input: {
                        id: widget.id,
                        backgroundColor: backgroundColor || null,
                        textColor: textColor || null,
                        iconColor: iconColor || null,
                        backgroundImage: backgroundImage || null,
                    },
                },
            });
            onClose();
        } catch (error) {
            console.error('Failed to update widget style:', error);
        }
    };
    const handleReset = async () => {
        try {
            await updateWidget({
                variables: {
                    input: {
                        id: widget.id,
                        backgroundColor: null,
                        textColor: null,
                        iconColor: null,
                        backgroundImage: null,
                    },
                },
            });
            setBackgroundColor('');
            setTextColor('');
            setIconColor('');
            setBackgroundImage('');
            onClose();
        } catch (error) {
            console.error('Failed to reset widget style:', error);
        }
    };

    const applyColorPreset = (preset: (typeof WIDGET_COLOR_PRESETS)[0]) => {
        setBackgroundColor(preset.backgroundColor);
        setTextColor(preset.textColor);
        setIconColor(preset.iconColor);
    };

    const applyBackgroundPreset = (
        preset: (typeof WIDGET_BACKGROUND_PRESETS)[0],
    ) => {
        setBackgroundImage(preset.url);
    };

    const applyGradientPreset = (
        preset: (typeof WIDGET_GRADIENT_PRESETS)[0],
    ) => {
        setBackgroundColor(preset.gradient);
    };

    const handleClearBackground = () => {
        setBackgroundColor('');
        setBackgroundImage('');
    };

    const handleClearColors = () => {
        setTextColor('');
        setIconColor('');
    };

    // Helper function to determine if background image is a data image (pattern)
    const isDataImage = (url: string) => {
        return url.startsWith('data:');
    };

    // Helper function to get background image styles based on image type
    const getBackgroundImageStyles = (imageUrl: string) => {
        if (isDataImage(imageUrl)) {
            return {
                backgroundSize: 'auto',
                backgroundPosition: 'top left',
                backgroundRepeat: 'repeat',
            };
        } else {
            return {
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            };
        }
    };

    return (
        <Card className='w-full max-w-2xl'>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Palette className='h-5 w-5' />
                    Widget Style
                </CardTitle>
                <CardDescription>
                    Customize the appearance of your widget
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Preview</Label>
                    <div
                        className='border-border flex h-16 w-full items-center justify-center rounded-md border text-sm font-medium'
                        style={{
                            ...(() => {
                                if (backgroundColor && backgroundImage) {
                                    const imageStyles =
                                        getBackgroundImageStyles(
                                            backgroundImage,
                                        );

                                    if (isDataImage(backgroundImage)) {
                                        if (
                                            isGradientBackground(
                                                backgroundColor,
                                            )
                                        ) {
                                            // Pattern + Gradient: pattern on top, gradient behind
                                            return {
                                                background: `url("${backgroundImage}"), ${backgroundColor}`,
                                                backgroundSize: `${imageStyles.backgroundSize}, cover`,
                                                backgroundPosition: `${imageStyles.backgroundPosition}, center`,
                                                backgroundRepeat: `${imageStyles.backgroundRepeat}, no-repeat`,
                                            };
                                        } else {
                                            // Pattern + Solid color: pattern on top, color behind
                                            return {
                                                backgroundColor:
                                                    backgroundColor,
                                                backgroundImage: `url("${backgroundImage}")`,
                                                ...imageStyles,
                                            };
                                        }
                                    } else {
                                        // Regular image: replaces background entirely
                                        return {
                                            backgroundImage: `url("${backgroundImage}")`,
                                            ...imageStyles,
                                        };
                                    }
                                } else if (backgroundColor) {
                                    // Only background color/gradient
                                    if (isGradientBackground(backgroundColor)) {
                                        return { background: backgroundColor };
                                    } else {
                                        return {
                                            backgroundColor: backgroundColor,
                                        };
                                    }
                                } else if (backgroundImage) {
                                    // Only background image
                                    const imageStyles =
                                        getBackgroundImageStyles(
                                            backgroundImage,
                                        );
                                    return {
                                        backgroundImage: `url("${backgroundImage}")`,
                                        ...imageStyles,
                                    };
                                }
                                return {};
                            })(),
                            color: textColor || undefined,
                        }}
                    >
                        <span
                            style={{
                                color: iconColor || textColor || undefined,
                            }}
                        >
                            Widget Preview
                        </span>
                    </div>
                </div>
                <Tabs defaultValue='colors' className='w-full'>
                    <TabsList className='grid w-full grid-cols-3'>
                        <TabsTrigger value='colors'>Colors</TabsTrigger>
                        <TabsTrigger value='gradients'>Gradients</TabsTrigger>
                        <TabsTrigger value='background'>Patterns</TabsTrigger>
                    </TabsList>

                    <div className='text-muted-foreground mt-2 mb-4 text-xs'>
                        💡 Tip: You can combine colors, gradients, and patterns
                        for unique effects
                    </div>

                    <TabsContent value='colors' className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>Color Presets</Label>
                            <div className='grid grid-cols-3 gap-2'>
                                {WIDGET_COLOR_PRESETS.map((preset) => (
                                    <Button
                                        key={preset.name}
                                        variant='outline'
                                        size='sm'
                                        className='h-8 cursor-pointer text-xs'
                                        style={{
                                            backgroundColor:
                                                preset.backgroundColor,
                                            color: preset.textColor,
                                            borderColor: preset.backgroundColor,
                                        }}
                                        onClick={() => {
                                            applyColorPreset(preset);
                                        }}
                                    >
                                        {preset.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='backgroundColor'>
                                Background Color
                            </Label>
                            <div className='flex gap-2'>
                                <Input
                                    id='backgroundColor'
                                    type='color'
                                    value={
                                        isGradientBackground(backgroundColor)
                                            ? '#3B82F6'
                                            : backgroundColor || '#3B82F6'
                                    }
                                    onChange={(e) => {
                                        setBackgroundColor(e.target.value);
                                    }}
                                    className='h-10 w-16 p-1'
                                />
                                <Input
                                    placeholder='#3B82F6 or gradient'
                                    value={backgroundColor}
                                    onChange={(e) => {
                                        setBackgroundColor(e.target.value);
                                        if (
                                            e.target.value &&
                                            !e.target.value.includes('gradient')
                                        ) {
                                            setBackgroundImage('');
                                        }
                                    }}
                                />
                            </div>
                            <p className='text-muted-foreground text-xs'>
                                Solid colors can be layered with patterns and
                                gradients
                            </p>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='textColor'>Text Color</Label>
                            <div className='flex gap-2'>
                                <Input
                                    id='textColor'
                                    type='color'
                                    value={colorToHex(textColor)}
                                    onChange={(e) => {
                                        setTextColor(e.target.value);
                                    }}
                                    className='h-10 w-16 p-1'
                                />
                                <Input
                                    placeholder='#FFFFFF'
                                    value={textColor}
                                    onChange={(e) => {
                                        setTextColor(e.target.value);
                                    }}
                                />
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='iconColor'>Icon Color</Label>
                            <div className='flex gap-2'>
                                <Input
                                    id='iconColor'
                                    type='color'
                                    value={colorToHex(iconColor)}
                                    onChange={(e) => {
                                        setIconColor(e.target.value);
                                    }}
                                    className='h-10 w-16 p-1'
                                />
                                <Input
                                    placeholder='#000000'
                                    value={iconColor}
                                    onChange={(e) => {
                                        setIconColor(e.target.value);
                                    }}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value='gradients' className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>Gradient Presets</Label>
                            <div className='grid grid-cols-2 gap-2'>
                                {WIDGET_GRADIENT_PRESETS.map((preset) => (
                                    <Button
                                        key={preset.name}
                                        variant='outline'
                                        size='sm'
                                        className='h-12 cursor-pointer justify-start overflow-hidden text-white'
                                        style={{
                                            background: preset.gradient,
                                            border: '1px solid rgba(255,255,255,0.2)',
                                        }}
                                        onClick={() => {
                                            applyGradientPreset(preset);
                                        }}
                                    >
                                        {preset.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='customGradient'>
                                Custom Gradient
                            </Label>
                            <Input
                                id='customGradient'
                                placeholder='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                value={
                                    isGradientBackground(backgroundColor)
                                        ? backgroundColor
                                        : ''
                                }
                                onChange={(e) => {
                                    setBackgroundColor(e.target.value);
                                    if (e.target.value) {
                                        setBackgroundImage('');
                                    }
                                }}
                            />
                            <p className='text-muted-foreground text-xs'>
                                Use CSS gradient syntax. Combines with patterns
                                for unique effects.
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value='background' className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>Pattern Presets</Label>
                            <div className='grid grid-cols-1 gap-2'>
                                {WIDGET_BACKGROUND_PRESETS.map((preset) => (
                                    <Button
                                        key={preset.name}
                                        variant='outline'
                                        size='sm'
                                        className='h-12 cursor-pointer justify-start'
                                        style={{
                                            backgroundImage: `url("${preset.url}")`,
                                            backgroundRepeat: 'repeat',
                                            backgroundColor: 'transparent',
                                        }}
                                        onClick={() => {
                                            applyBackgroundPreset(preset);
                                        }}
                                    >
                                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                                        <Image className='mr-2 h-4 w-4' />
                                        {preset.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='backgroundImage'>
                                Custom Background Image URL
                            </Label>
                            <Input
                                id='backgroundImage'
                                placeholder='https://example.com/image.jpg'
                                value={backgroundImage}
                                onChange={(e) => {
                                    setBackgroundImage(e.target.value);
                                }}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
                <div className='flex gap-2 pt-4'>
                    <Button
                        onClick={() => {
                            void handleSave();
                        }}
                        className='flex-1 cursor-pointer'
                    >
                        Apply Changes
                    </Button>
                    <Button
                        variant='outline'
                        onClick={handleClearBackground}
                        className='cursor-pointer'
                        title='Clear background styles'
                    >
                        Clear BG
                    </Button>
                    <Button
                        variant='outline'
                        onClick={handleClearColors}
                        className='cursor-pointer'
                        title='Clear text and icon colors'
                    >
                        Clear Colors
                    </Button>
                    <Button
                        variant='outline'
                        onClick={() => {
                            void handleReset();
                        }}
                        className='cursor-pointer'
                    >
                        <RotateCcw className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='outline'
                        onClick={onClose}
                        className='cursor-pointer'
                    >
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
