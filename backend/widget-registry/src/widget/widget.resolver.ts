import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { WidgetService } from './widget.service';
import {
    CreateWidgetInput,
    UpdateWidgetInput,
    UpdateWidgetLayoutInput,
    Widget,
} from './widget.types';

@Resolver(() => Widget)
export class WidgetResolver {
    constructor(private readonly widgetService: WidgetService) {}

    @Query(() => [Widget], { name: 'widgets' })
    async getWidgets(
        @Args('userId', { type: () => ID }) userId: string,
    ): Promise<Widget[]> {
        return await this.widgetService.getWidgetsForUser(userId);
    }

    @Query(() => Widget, { name: 'widget', nullable: true })
    async getWidget(
        @Args('id', { type: () => ID }) id: string,
    ): Promise<Widget | null> {
        return this.widgetService.getWidgetById(id);
    }

    @Query(() => [Widget], { name: 'widgetsByType' })
    async getWidgetsByType(@Args('type') type: string): Promise<Widget[]> {
        return this.widgetService.getWidgetsByType(type);
    }

    @Query(() => [String], { name: 'availableWidgetTypes' })
    async getAvailableWidgetTypes(): Promise<string[]> {
        return this.widgetService.getAvailableWidgetTypes();
    }

    @Mutation(() => Widget)
    async createWidget(
        @Args('userId', { type: () => ID }) userId: string,
        @Args('input') input: CreateWidgetInput,
    ): Promise<Widget> {
        return this.widgetService.createWidget(userId, input);
    }

    @Mutation(() => Widget)
    async updateWidget(
        @Args('input') input: UpdateWidgetInput,
    ): Promise<Widget> {
        return this.widgetService.updateWidget(input);
    }

    @Mutation(() => Widget)
    async updateWidgetLayout(
        @Args('input') input: UpdateWidgetLayoutInput,
    ): Promise<Widget> {
        return this.widgetService.updateWidgetLayout(input);
    }

    @Mutation(() => Boolean)
    async deleteWidget(
        @Args('id', { type: () => ID }) id: string,
    ): Promise<boolean> {
        return this.widgetService.deleteWidget(id);
    }
}
