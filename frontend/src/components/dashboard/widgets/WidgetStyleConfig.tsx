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
} from '@/lib/utils/widgetStyles';
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
                        backgroundImage: null,
                    },
                },
            });
            setBackgroundColor('');
            setTextColor('');
            setBackgroundImage('');
            onClose();
        } catch (error) {
            console.error('Failed to reset widget style:', error);
        }
    };

    const applyColorPreset = (preset: (typeof WIDGET_COLOR_PRESETS)[0]) => {
        setBackgroundColor(preset.backgroundColor);
        setTextColor(preset.textColor);
        setBackgroundImage('');
    };

    const applyBackgroundPreset = (
        preset: (typeof WIDGET_BACKGROUND_PRESETS)[0],
    ) => {
        setBackgroundImage(preset.url);
        setBackgroundColor('');
    };

    console.log(WIDGET_BACKGROUND_PRESETS);

    return (
        <Card className='w-96'>
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
                <Tabs defaultValue='colors' className='w-full'>
                    <TabsList className='grid w-full grid-cols-2'>
                        <TabsTrigger value='colors'>Colors</TabsTrigger>
                        <TabsTrigger value='background'>Background</TabsTrigger>
                    </TabsList>

                    <TabsContent value='colors' className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>Color Presets</Label>
                            <div className='grid grid-cols-3 gap-2'>
                                {WIDGET_COLOR_PRESETS.map((preset) => (
                                    <Button
                                        key={preset.name}
                                        variant='outline'
                                        size='sm'
                                        className='h-8 text-xs'
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
                                {' '}
                                <Input
                                    id='backgroundColor'
                                    type='color'
                                    value={backgroundColor}
                                    onChange={(e) => {
                                        setBackgroundColor(e.target.value);
                                    }}
                                    className='h-10 w-16 p-1'
                                />
                                <Input
                                    placeholder='#3B82F6'
                                    value={backgroundColor}
                                    onChange={(e) => {
                                        setBackgroundColor(e.target.value);
                                    }}
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='textColor'>Text Color</Label>
                            <div className='flex gap-2'>
                                {' '}
                                <Input
                                    id='textColor'
                                    type='color'
                                    value={textColor}
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
                                        className='h-12 justify-start'
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
                        className='flex-1'
                    >
                        Apply Changes
                    </Button>
                    <Button
                        variant='outline'
                        onClick={() => {
                            void handleReset();
                        }}
                    >
                        <RotateCcw className='h-4 w-4' />
                    </Button>
                    <Button variant='outline' onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
