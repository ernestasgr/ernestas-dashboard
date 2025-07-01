/* eslint-disable @typescript-eslint/no-explicit-any */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends Record<string, unknown>> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
    T extends Record<string, unknown>,
    K extends keyof T,
> = Partial<Record<K, never>>;
export type Incremental<T> =
    | T
    | {
          [P in keyof T]?: P extends ' $fragmentName' | '__typename'
              ? T[P]
              : never;
      };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
    ID: { input: string; output: string };
    String: { input: string; output: string };
    Boolean: { input: boolean; output: boolean };
    Int: { input: number; output: number };
    Float: { input: number; output: number };
    DateTime: { input: any; output: any };
    JSON: { input: any; output: any };
}

export interface AuthPayload {
    __typename?: 'AuthPayload';
    email: Scalars['String']['output'];
    name?: Maybe<Scalars['String']['output']>;
}

export interface ClockConfig {
    __typename?: 'ClockConfig';
    format?: Maybe<Scalars['String']['output']>;
    timezone: Scalars['String']['output'];
}

export interface CreateNoteInput {
    content: Scalars['String']['input'];
    height?: InputMaybe<Scalars['Int']['input']>;
    labels?: Scalars['String']['input'][];
    title: Scalars['String']['input'];
    widgetId: Scalars['ID']['input'];
    width?: InputMaybe<Scalars['Int']['input']>;
    x?: InputMaybe<Scalars['Int']['input']>;
    y?: InputMaybe<Scalars['Int']['input']>;
}

export interface CreateNoteWithObsidianSyncInput {
    content: Scalars['String']['input'];
    height?: InputMaybe<Scalars['Int']['input']>;
    labels?: Scalars['String']['input'][];
    obsidianApiUrl?: InputMaybe<Scalars['String']['input']>;
    obsidianAuthKey?: InputMaybe<Scalars['String']['input']>;
    syncToObsidian?: Scalars['Boolean']['input'];
    title: Scalars['String']['input'];
    widgetId: Scalars['ID']['input'];
    width?: InputMaybe<Scalars['Int']['input']>;
    x?: InputMaybe<Scalars['Int']['input']>;
    y?: InputMaybe<Scalars['Int']['input']>;
}

export interface CreateOrUpdateObsidianFileInput {
    apiUrl: Scalars['String']['input'];
    authKey: Scalars['String']['input'];
    content: Scalars['String']['input'];
    filePath: Scalars['String']['input'];
}

export interface CreateTaskInput {
    category: Scalars['String']['input'];
    description?: InputMaybe<Scalars['String']['input']>;
    displayOrder?: Scalars['Int']['input'];
    dueDate?: InputMaybe<Scalars['DateTime']['input']>;
    parentTaskId?: InputMaybe<Scalars['Int']['input']>;
    priority?: Scalars['Int']['input'];
    text: Scalars['String']['input'];
    widgetId?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateWidgetInput {
    backgroundColor?: InputMaybe<Scalars['String']['input']>;
    backgroundImage?: InputMaybe<Scalars['String']['input']>;
    config?: InputMaybe<Scalars['JSON']['input']>;
    height: Scalars['Int']['input'];
    iconColor?: InputMaybe<Scalars['String']['input']>;
    textColor?: InputMaybe<Scalars['String']['input']>;
    title?: InputMaybe<Scalars['String']['input']>;
    type: Scalars['String']['input'];
    width: Scalars['Int']['input'];
    x: Scalars['Int']['input'];
    y: Scalars['Int']['input'];
}

export interface DeleteNoteWithObsidianSyncInput {
    id: Scalars['ID']['input'];
    obsidianApiUrl?: InputMaybe<Scalars['String']['input']>;
    obsidianAuthKey?: InputMaybe<Scalars['String']['input']>;
    syncToObsidian?: Scalars['Boolean']['input'];
}

export interface MessageResult {
    __typename?: 'MessageResult';
    message: Scalars['String']['output'];
}

export interface Mutation {
    __typename?: 'Mutation';
    createNote: NoteType;
    createNoteWithObsidianSync: NoteType;
    createOrUpdateObsidianFile: Scalars['Boolean']['output'];
    createTask: TaskType;
    createWidget: Widget;
    deleteNote: Scalars['Boolean']['output'];
    deleteNoteWithObsidianSync: Scalars['Boolean']['output'];
    deleteTask: Scalars['Boolean']['output'];
    deleteWidget: Scalars['Boolean']['output'];
    logout: MessageResult;
    refresh: MessageResult;
    reorderTask?: Maybe<TaskType>;
    syncObsidianVault: NoteType[];
    testObsidianConnection: Scalars['Boolean']['output'];
    toggleTaskCompletion?: Maybe<TaskType>;
    updateNote: NoteType;
    updateNoteLayout: NoteType;
    updateNoteWithObsidianSync: NoteType;
    updateTask?: Maybe<TaskType>;
    updateWidget: Widget;
    updateWidgetLayout: Widget;
}

export interface MutationCreateNoteArgs {
    input: CreateNoteInput;
}

export interface MutationCreateNoteWithObsidianSyncArgs {
    input: CreateNoteWithObsidianSyncInput;
}

export interface MutationCreateOrUpdateObsidianFileArgs {
    input: CreateOrUpdateObsidianFileInput;
}

export interface MutationCreateTaskArgs {
    input: CreateTaskInput;
}

export interface MutationCreateWidgetArgs {
    input: CreateWidgetInput;
    userId: Scalars['ID']['input'];
}

export interface MutationDeleteNoteArgs {
    id: Scalars['ID']['input'];
}

export interface MutationDeleteNoteWithObsidianSyncArgs {
    input: DeleteNoteWithObsidianSyncInput;
}

export interface MutationDeleteTaskArgs {
    id: Scalars['Int']['input'];
}

export interface MutationDeleteWidgetArgs {
    id: Scalars['ID']['input'];
}

export interface MutationReorderTaskArgs {
    input: ReorderTaskInput;
}

export interface MutationSyncObsidianVaultArgs {
    input: ObsidianSyncInput;
}

export interface MutationTestObsidianConnectionArgs {
    input: ObsidianTestConnectionInput;
}

export interface MutationToggleTaskCompletionArgs {
    id: Scalars['Int']['input'];
}

export interface MutationUpdateNoteArgs {
    input: UpdateNoteInput;
}

export interface MutationUpdateNoteLayoutArgs {
    input: UpdateNoteLayoutInput;
}

export interface MutationUpdateNoteWithObsidianSyncArgs {
    input: UpdateNoteWithObsidianSyncInput;
}

export interface MutationUpdateTaskArgs {
    input: UpdateTaskInput;
}

export interface MutationUpdateWidgetArgs {
    input: UpdateWidgetInput;
}

export interface MutationUpdateWidgetLayoutArgs {
    input: UpdateWidgetLayoutInput;
}

export interface NoteType {
    __typename?: 'NoteType';
    content: Scalars['String']['output'];
    createdAt: Scalars['DateTime']['output'];
    height?: Maybe<Scalars['Int']['output']>;
    id: Scalars['ID']['output'];
    labels: Scalars['String']['output'][];
    obsidianPath?: Maybe<Scalars['String']['output']>;
    source: Scalars['String']['output'];
    title: Scalars['String']['output'];
    updatedAt: Scalars['DateTime']['output'];
    widgetId: Scalars['ID']['output'];
    width?: Maybe<Scalars['Int']['output']>;
    x?: Maybe<Scalars['Int']['output']>;
    y?: Maybe<Scalars['Int']['output']>;
}

export interface NotesConfig {
    __typename?: 'NotesConfig';
    enableObsidianSync: Scalars['Boolean']['output'];
    gridColumns: Scalars['Float']['output'];
    maxLength?: Maybe<Scalars['Float']['output']>;
    obsidianApiUrl?: Maybe<Scalars['String']['output']>;
    obsidianAuthKey?: Maybe<Scalars['String']['output']>;
    obsidianVaultName?: Maybe<Scalars['String']['output']>;
    showGrid: Scalars['Boolean']['output'];
    visibleLabels?: Maybe<Scalars['String']['output'][]>;
}

export interface NotesFilterInput {
    labels?: InputMaybe<Scalars['String']['input'][]>;
    widgetId: Scalars['ID']['input'];
}

export interface ObsidianSyncInput {
    apiUrl: Scalars['String']['input'];
    authKey: Scalars['String']['input'];
    widgetId: Scalars['ID']['input'];
}

export interface ObsidianTestConnectionInput {
    apiUrl: Scalars['String']['input'];
    authKey: Scalars['String']['input'];
}

export interface Query {
    __typename?: 'Query';
    availableWidgetTypes: Scalars['String']['output'][];
    me: AuthPayload;
    note?: Maybe<NoteType>;
    notes: NoteType[];
    resolveTaskReference?: Maybe<TaskType>;
    resolveUserReference: UserType;
    task?: Maybe<TaskType>;
    taskCategories: Scalars['String']['output'][];
    taskHierarchy: TaskType[];
    tasks: TaskType[];
    tasksForUser: TaskType[];
    widget?: Maybe<Widget>;
    widgets: Widget[];
    widgetsByType: Widget[];
}

export interface QueryNoteArgs {
    id: Scalars['ID']['input'];
}

export interface QueryNotesArgs {
    filter: NotesFilterInput;
}

export interface QueryResolveTaskReferenceArgs {
    taskReference: TaskTypeInput;
}

export interface QueryResolveUserReferenceArgs {
    userReference: UserTypeInput;
}

export interface QueryTaskArgs {
    id: Scalars['Int']['input'];
}

export interface QueryTaskHierarchyArgs {
    filter?: InputMaybe<TasksFilterInput>;
}

export interface QueryTasksArgs {
    filter?: InputMaybe<TasksFilterInput>;
}

export interface QueryTasksForUserArgs {
    filter?: InputMaybe<TasksFilterInput>;
}

export interface QueryWidgetArgs {
    id: Scalars['ID']['input'];
}

export interface QueryWidgetsArgs {
    userId: Scalars['ID']['input'];
}

export interface QueryWidgetsByTypeArgs {
    type: Scalars['String']['input'];
}

export interface ReorderTaskInput {
    newDisplayOrder: Scalars['Int']['input'];
    newParentTaskId?: InputMaybe<Scalars['Int']['input']>;
    taskId: Scalars['Int']['input'];
}

export interface TaskType {
    __typename?: 'TaskType';
    category: Scalars['String']['output'];
    completed: Scalars['Boolean']['output'];
    createdAt: Scalars['DateTime']['output'];
    description?: Maybe<Scalars['String']['output']>;
    displayOrder: Scalars['Int']['output'];
    dueDate?: Maybe<Scalars['DateTime']['output']>;
    id: Scalars['ID']['output'];
    parentTaskId?: Maybe<Scalars['Int']['output']>;
    priority: Scalars['Int']['output'];
    subTasks?: Maybe<TaskType[]>;
    text: Scalars['String']['output'];
    updatedAt: Scalars['DateTime']['output'];
    userId: Scalars['String']['output'];
    widgetId?: Maybe<Scalars['String']['output']>;
}

export interface TaskTypeInput {
    category: Scalars['String']['input'];
    completed: Scalars['Boolean']['input'];
    createdAt: Scalars['DateTime']['input'];
    description?: InputMaybe<Scalars['String']['input']>;
    displayOrder: Scalars['Int']['input'];
    dueDate?: InputMaybe<Scalars['DateTime']['input']>;
    id: Scalars['ID']['input'];
    parentTaskId?: InputMaybe<Scalars['Int']['input']>;
    priority: Scalars['Int']['input'];
    subTasks?: InputMaybe<TaskTypeInput[]>;
    text: Scalars['String']['input'];
    updatedAt: Scalars['DateTime']['input'];
    userId: Scalars['String']['input'];
    widgetId?: InputMaybe<Scalars['String']['input']>;
}

export interface TasksConfig {
    __typename?: 'TasksConfig';
    categories: Scalars['String']['output'][];
    defaultCategory?: Maybe<Scalars['String']['output']>;
}

export interface TasksFilterInput {
    category?: InputMaybe<Scalars['String']['input']>;
    completed?: InputMaybe<Scalars['Boolean']['input']>;
    dueAfter?: InputMaybe<Scalars['DateTime']['input']>;
    dueBefore?: InputMaybe<Scalars['DateTime']['input']>;
    maxPriority?: InputMaybe<Scalars['Int']['input']>;
    minPriority?: InputMaybe<Scalars['Int']['input']>;
    widgetId?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateNoteInput {
    content?: InputMaybe<Scalars['String']['input']>;
    height?: InputMaybe<Scalars['Int']['input']>;
    id: Scalars['ID']['input'];
    labels?: InputMaybe<Scalars['String']['input'][]>;
    title?: InputMaybe<Scalars['String']['input']>;
    width?: InputMaybe<Scalars['Int']['input']>;
    x?: InputMaybe<Scalars['Int']['input']>;
    y?: InputMaybe<Scalars['Int']['input']>;
}

export interface UpdateNoteLayoutInput {
    height: Scalars['Int']['input'];
    id: Scalars['ID']['input'];
    width: Scalars['Int']['input'];
    x: Scalars['Int']['input'];
    y: Scalars['Int']['input'];
}

export interface UpdateNoteWithObsidianSyncInput {
    content?: InputMaybe<Scalars['String']['input']>;
    height?: InputMaybe<Scalars['Int']['input']>;
    id: Scalars['ID']['input'];
    labels?: InputMaybe<Scalars['String']['input'][]>;
    obsidianApiUrl?: InputMaybe<Scalars['String']['input']>;
    obsidianAuthKey?: InputMaybe<Scalars['String']['input']>;
    syncToObsidian?: Scalars['Boolean']['input'];
    title?: InputMaybe<Scalars['String']['input']>;
    width?: InputMaybe<Scalars['Int']['input']>;
    x?: InputMaybe<Scalars['Int']['input']>;
    y?: InputMaybe<Scalars['Int']['input']>;
}

export interface UpdateTaskInput {
    category?: InputMaybe<Scalars['String']['input']>;
    completed?: InputMaybe<Scalars['Boolean']['input']>;
    description?: InputMaybe<Scalars['String']['input']>;
    displayOrder?: InputMaybe<Scalars['Int']['input']>;
    dueDate?: InputMaybe<Scalars['DateTime']['input']>;
    id: Scalars['Int']['input'];
    parentTaskId?: InputMaybe<Scalars['Int']['input']>;
    priority?: InputMaybe<Scalars['Int']['input']>;
    text?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateWidgetInput {
    backgroundColor?: InputMaybe<Scalars['String']['input']>;
    backgroundImage?: InputMaybe<Scalars['String']['input']>;
    config?: InputMaybe<Scalars['JSON']['input']>;
    height?: InputMaybe<Scalars['Int']['input']>;
    iconColor?: InputMaybe<Scalars['String']['input']>;
    id: Scalars['ID']['input'];
    textColor?: InputMaybe<Scalars['String']['input']>;
    title?: InputMaybe<Scalars['String']['input']>;
    width?: InputMaybe<Scalars['Int']['input']>;
    x?: InputMaybe<Scalars['Int']['input']>;
    y?: InputMaybe<Scalars['Int']['input']>;
}

export interface UpdateWidgetLayoutInput {
    height: Scalars['Int']['input'];
    id: Scalars['ID']['input'];
    width: Scalars['Int']['input'];
    x: Scalars['Int']['input'];
    y: Scalars['Int']['input'];
}

export interface UserType {
    __typename?: 'UserType';
    id: Scalars['ID']['output'];
}

export interface UserTypeInput {
    id: Scalars['ID']['input'];
}

export interface WeatherConfig {
    __typename?: 'WeatherConfig';
    location: Scalars['String']['output'];
    units?: Maybe<Scalars['String']['output']>;
}

export interface Widget {
    __typename?: 'Widget';
    backgroundColor?: Maybe<Scalars['String']['output']>;
    backgroundImage?: Maybe<Scalars['String']['output']>;
    config?: Maybe<WidgetConfig>;
    height: Scalars['Int']['output'];
    iconColor?: Maybe<Scalars['String']['output']>;
    id: Scalars['ID']['output'];
    textColor?: Maybe<Scalars['String']['output']>;
    title?: Maybe<Scalars['String']['output']>;
    type: Scalars['String']['output'];
    width: Scalars['Int']['output'];
    x: Scalars['Int']['output'];
    y: Scalars['Int']['output'];
}

export type WidgetConfig =
    | ClockConfig
    | NotesConfig
    | TasksConfig
    | WeatherConfig;
