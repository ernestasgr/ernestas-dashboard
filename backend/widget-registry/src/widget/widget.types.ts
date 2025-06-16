import { Field, ID, ObjectType, createUnionType } from '@nestjs/graphql';

@ObjectType()
export class Widget {
    @Field(() => ID)
    id: string;

    @Field()
    type: string;

    @Field({ nullable: true })
    title?: string;

    @Field(() => WidgetConfig, { nullable: true })
    config?: typeof WidgetConfig;
}

@ObjectType()
export class ClockConfig {
    @Field()
    timezone: string;

    @Field({ nullable: true })
    format?: string;
}

@ObjectType()
export class WeatherConfig {
    @Field()
    location: string;

    @Field({ nullable: true })
    units?: string;
}

@ObjectType()
export class NotesConfig {
    @Field()
    content: string;

    @Field({ nullable: true })
    maxLength?: number;
}

@ObjectType()
export class TasksConfig {
    @Field(() => [String])
    categories: string[];

    @Field({ nullable: true })
    defaultCategory?: string;
}

export const WidgetConfig = createUnionType({
    name: 'WidgetConfig',
    types: () =>
        [ClockConfig, WeatherConfig, NotesConfig, TasksConfig] as const,
    resolveType: (value) => {
        if ('timezone' in value) return ClockConfig;
        if ('location' in value) return WeatherConfig;
        if ('content' in value) return NotesConfig;
        if ('categories' in value) return TasksConfig;
        return null;
    },
});
