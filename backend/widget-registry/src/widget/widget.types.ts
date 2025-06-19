import {
    createUnionType,
    Field,
    ID,
    InputType,
    Int,
    ObjectType,
} from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

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

    @Field(() => Int)
    x: number;

    @Field(() => Int)
    y: number;

    @Field(() => Int)
    width: number;

    @Field(() => Int)
    height: number;

    @Field({ nullable: true })
    backgroundColor?: string;

    @Field({ nullable: true })
    textColor?: string;

    @Field({ nullable: true })
    backgroundImage?: string;
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

@InputType()
export class CreateWidgetInput {
    @Field()
    type: string;

    @Field({ nullable: true })
    title?: string;

    @Field(() => GraphQLJSON, { nullable: true })
    config?: any;

    @Field(() => Int)
    x: number;

    @Field(() => Int)
    y: number;

    @Field(() => Int)
    width: number;

    @Field(() => Int)
    height: number;

    @Field({ nullable: true })
    backgroundColor?: string;

    @Field({ nullable: true })
    textColor?: string;

    @Field({ nullable: true })
    backgroundImage?: string;
}

@InputType()
export class UpdateWidgetLayoutInput {
    @Field(() => ID)
    id: string;

    @Field(() => Int)
    x: number;

    @Field(() => Int)
    y: number;

    @Field(() => Int)
    width: number;

    @Field(() => Int)
    height: number;
}

@InputType()
export class UpdateWidgetInput {
    @Field(() => ID)
    id: string;

    @Field({ nullable: true })
    title?: string;

    @Field(() => GraphQLJSON, { nullable: true })
    config?: any;

    @Field(() => Int, { nullable: true })
    x?: number;

    @Field(() => Int, { nullable: true })
    y?: number;

    @Field(() => Int, { nullable: true })
    width?: number;

    @Field(() => Int, { nullable: true })
    height?: number;

    @Field({ nullable: true })
    backgroundColor?: string;

    @Field({ nullable: true })
    textColor?: string;

    @Field({ nullable: true })
    backgroundImage?: string;
}
