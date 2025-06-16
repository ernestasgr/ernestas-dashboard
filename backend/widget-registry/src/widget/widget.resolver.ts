import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { WidgetService } from './widget.service';
import { Widget } from './widget.types';

@Resolver(() => Widget)
export class WidgetResolver {
    constructor(private readonly widgetService: WidgetService) {}

    @Query(() => [Widget], { name: 'widgets' })
    async getWidgets(
        @Args('userId', { type: () => ID }) userId: string,
    ): Promise<Widget[]> {
        return this.widgetService.getWidgetsForUser(userId);
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
}
