import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  email: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type ClockConfig = {
  __typename?: 'ClockConfig';
  format?: Maybe<Scalars['String']['output']>;
  timezone: Scalars['String']['output'];
};

export type CreateNoteInput = {
  content: Scalars['String']['input'];
  height?: InputMaybe<Scalars['Int']['input']>;
  labels?: Array<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  widgetId: Scalars['ID']['input'];
  width?: InputMaybe<Scalars['Int']['input']>;
  x?: InputMaybe<Scalars['Int']['input']>;
  y?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateWidgetInput = {
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
};

export type MessageResult = {
  __typename?: 'MessageResult';
  message: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createNote: NoteType;
  createWidget: Widget;
  deleteNote: Scalars['Boolean']['output'];
  deleteWidget: Scalars['Boolean']['output'];
  logout: MessageResult;
  refresh: MessageResult;
  updateNote: NoteType;
  updateNoteLayout: NoteType;
  updateWidget: Widget;
  updateWidgetLayout: Widget;
};


export type MutationCreateNoteArgs = {
  input: CreateNoteInput;
};


export type MutationCreateWidgetArgs = {
  input: CreateWidgetInput;
  userId: Scalars['ID']['input'];
};


export type MutationDeleteNoteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWidgetArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateNoteArgs = {
  input: UpdateNoteInput;
};


export type MutationUpdateNoteLayoutArgs = {
  input: UpdateNoteLayoutInput;
};


export type MutationUpdateWidgetArgs = {
  input: UpdateWidgetInput;
};


export type MutationUpdateWidgetLayoutArgs = {
  input: UpdateWidgetLayoutInput;
};

export type NoteType = {
  __typename?: 'NoteType';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  height?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  labels: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  widgetId: Scalars['ID']['output'];
  width?: Maybe<Scalars['Int']['output']>;
  x?: Maybe<Scalars['Int']['output']>;
  y?: Maybe<Scalars['Int']['output']>;
};

export type NotesConfig = {
  __typename?: 'NotesConfig';
  gridColumns: Scalars['Float']['output'];
  maxLength?: Maybe<Scalars['Float']['output']>;
  showGrid: Scalars['Boolean']['output'];
  visibleLabels?: Maybe<Array<Scalars['String']['output']>>;
};

export type NotesFilterInput = {
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  widgetId: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  availableWidgetTypes: Array<Scalars['String']['output']>;
  me: AuthPayload;
  note?: Maybe<NoteType>;
  notes: Array<NoteType>;
  widget?: Maybe<Widget>;
  widgets: Array<Widget>;
  widgetsByType: Array<Widget>;
};


export type QueryNoteArgs = {
  id: Scalars['ID']['input'];
};


export type QueryNotesArgs = {
  filter: NotesFilterInput;
};


export type QueryWidgetArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWidgetsArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryWidgetsByTypeArgs = {
  type: Scalars['String']['input'];
};

export type TasksConfig = {
  __typename?: 'TasksConfig';
  categories: Array<Scalars['String']['output']>;
  defaultCategory?: Maybe<Scalars['String']['output']>;
};

export type UpdateNoteInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
  x?: InputMaybe<Scalars['Int']['input']>;
  y?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateNoteLayoutInput = {
  height: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  width: Scalars['Int']['input'];
  x: Scalars['Int']['input'];
  y: Scalars['Int']['input'];
};

export type UpdateWidgetInput = {
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
};

export type UpdateWidgetLayoutInput = {
  height: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  width: Scalars['Int']['input'];
  x: Scalars['Int']['input'];
  y: Scalars['Int']['input'];
};

export type WeatherConfig = {
  __typename?: 'WeatherConfig';
  location: Scalars['String']['output'];
  units?: Maybe<Scalars['String']['output']>;
};

export type Widget = {
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
};

export type WidgetConfig = ClockConfig | NotesConfig | TasksConfig | WeatherConfig;

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'AuthPayload', email: string, name?: string | null } };

export type GetNotesQueryVariables = Exact<{
  filter: NotesFilterInput;
}>;


export type GetNotesQuery = { __typename?: 'Query', notes: Array<{ __typename?: 'NoteType', id: string, title: string, content: string, labels: Array<string>, widgetId: string, createdAt: any, updatedAt: any, x?: number | null, y?: number | null, width?: number | null, height?: number | null }> };

export type GetNoteQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetNoteQuery = { __typename?: 'Query', note?: { __typename?: 'NoteType', id: string, title: string, content: string, labels: Array<string>, widgetId: string, createdAt: any, updatedAt: any, x?: number | null, y?: number | null, width?: number | null, height?: number | null } | null };

export type CreateNoteMutationVariables = Exact<{
  input: CreateNoteInput;
}>;


export type CreateNoteMutation = { __typename?: 'Mutation', createNote: { __typename?: 'NoteType', id: string, title: string, content: string, labels: Array<string>, widgetId: string, createdAt: any, updatedAt: any, x?: number | null, y?: number | null, width?: number | null, height?: number | null } };

export type UpdateNoteMutationVariables = Exact<{
  input: UpdateNoteInput;
}>;


export type UpdateNoteMutation = { __typename?: 'Mutation', updateNote: { __typename?: 'NoteType', id: string, title: string, content: string, labels: Array<string>, widgetId: string, createdAt: any, updatedAt: any, x?: number | null, y?: number | null, width?: number | null, height?: number | null } };

export type UpdateNoteLayoutMutationVariables = Exact<{
  input: UpdateNoteLayoutInput;
}>;


export type UpdateNoteLayoutMutation = { __typename?: 'Mutation', updateNoteLayout: { __typename?: 'NoteType', id: string, title: string, content: string, labels: Array<string>, widgetId: string, createdAt: any, updatedAt: any, x?: number | null, y?: number | null, width?: number | null, height?: number | null } };

export type DeleteNoteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteNoteMutation = { __typename?: 'Mutation', deleteNote: boolean };

export type RefreshMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshMutation = { __typename?: 'Mutation', refresh: { __typename?: 'MessageResult', message: string } };

export type GetWidgetsQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetWidgetsQuery = { __typename?: 'Query', widgets: Array<{ __typename?: 'Widget', id: string, type: string, title?: string | null, x: number, y: number, width: number, height: number, backgroundColor?: string | null, textColor?: string | null, iconColor?: string | null, backgroundImage?: string | null, config?: { __typename?: 'ClockConfig', timezone: string, format?: string | null } | { __typename?: 'NotesConfig', maxLength?: number | null, visibleLabels?: Array<string> | null, showGrid: boolean, gridColumns: number } | { __typename?: 'TasksConfig', categories: Array<string>, defaultCategory?: string | null } | { __typename?: 'WeatherConfig', location: string, units?: string | null } | null }> };

export type GetWidgetQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetWidgetQuery = { __typename?: 'Query', widget?: { __typename?: 'Widget', id: string, type: string, title?: string | null, x: number, y: number, width: number, height: number, backgroundColor?: string | null, textColor?: string | null, iconColor?: string | null, backgroundImage?: string | null, config?: { __typename?: 'ClockConfig', timezone: string, format?: string | null } | { __typename?: 'NotesConfig', maxLength?: number | null, visibleLabels?: Array<string> | null, showGrid: boolean, gridColumns: number } | { __typename?: 'TasksConfig', categories: Array<string>, defaultCategory?: string | null } | { __typename?: 'WeatherConfig', location: string, units?: string | null } | null } | null };

export type GetWidgetsByTypeQueryVariables = Exact<{
  type: Scalars['String']['input'];
}>;


export type GetWidgetsByTypeQuery = { __typename?: 'Query', widgetsByType: Array<{ __typename?: 'Widget', id: string, type: string, title?: string | null, x: number, y: number, width: number, height: number, backgroundColor?: string | null, textColor?: string | null, iconColor?: string | null, backgroundImage?: string | null, config?: { __typename?: 'ClockConfig', timezone: string, format?: string | null } | { __typename?: 'NotesConfig', maxLength?: number | null, visibleLabels?: Array<string> | null, showGrid: boolean, gridColumns: number } | { __typename?: 'TasksConfig', categories: Array<string>, defaultCategory?: string | null } | { __typename?: 'WeatherConfig', location: string, units?: string | null } | null }> };

export type GetAvailableWidgetTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAvailableWidgetTypesQuery = { __typename?: 'Query', availableWidgetTypes: Array<string> };

export type CreateWidgetMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  input: CreateWidgetInput;
}>;


export type CreateWidgetMutation = { __typename?: 'Mutation', createWidget: { __typename?: 'Widget', id: string, type: string, title?: string | null, x: number, y: number, width: number, height: number, backgroundColor?: string | null, textColor?: string | null, iconColor?: string | null, backgroundImage?: string | null, config?: { __typename?: 'ClockConfig', timezone: string, format?: string | null } | { __typename?: 'NotesConfig', maxLength?: number | null, visibleLabels?: Array<string> | null, showGrid: boolean, gridColumns: number } | { __typename?: 'TasksConfig', categories: Array<string>, defaultCategory?: string | null } | { __typename?: 'WeatherConfig', location: string, units?: string | null } | null } };

export type UpdateWidgetMutationVariables = Exact<{
  input: UpdateWidgetInput;
}>;


export type UpdateWidgetMutation = { __typename?: 'Mutation', updateWidget: { __typename?: 'Widget', id: string, type: string, title?: string | null, x: number, y: number, width: number, height: number, backgroundColor?: string | null, textColor?: string | null, iconColor?: string | null, backgroundImage?: string | null, config?: { __typename?: 'ClockConfig', timezone: string, format?: string | null } | { __typename?: 'NotesConfig', maxLength?: number | null, visibleLabels?: Array<string> | null, showGrid: boolean, gridColumns: number } | { __typename?: 'TasksConfig', categories: Array<string>, defaultCategory?: string | null } | { __typename?: 'WeatherConfig', location: string, units?: string | null } | null } };

export type UpdateWidgetLayoutMutationVariables = Exact<{
  input: UpdateWidgetLayoutInput;
}>;


export type UpdateWidgetLayoutMutation = { __typename?: 'Mutation', updateWidgetLayout: { __typename?: 'Widget', id: string, type: string, title?: string | null, x: number, y: number, width: number, height: number, backgroundColor?: string | null, textColor?: string | null, iconColor?: string | null, backgroundImage?: string | null, config?: { __typename?: 'ClockConfig', timezone: string, format?: string | null } | { __typename?: 'NotesConfig', maxLength?: number | null, visibleLabels?: Array<string> | null, showGrid: boolean, gridColumns: number } | { __typename?: 'TasksConfig', categories: Array<string>, defaultCategory?: string | null } | { __typename?: 'WeatherConfig', location: string, units?: string | null } | null } };

export type DeleteWidgetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteWidgetMutation = { __typename?: 'Mutation', deleteWidget: boolean };


export const MeDocument = gql`
    query Me {
  me {
    email
    name
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const GetNotesDocument = gql`
    query GetNotes($filter: NotesFilterInput!) {
  notes(filter: $filter) {
    id
    title
    content
    labels
    widgetId
    createdAt
    updatedAt
    x
    y
    width
    height
  }
}
    `;

/**
 * __useGetNotesQuery__
 *
 * To run a query within a React component, call `useGetNotesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNotesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNotesQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetNotesQuery(baseOptions: Apollo.QueryHookOptions<GetNotesQuery, GetNotesQueryVariables> & ({ variables: GetNotesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNotesQuery, GetNotesQueryVariables>(GetNotesDocument, options);
      }
export function useGetNotesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNotesQuery, GetNotesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNotesQuery, GetNotesQueryVariables>(GetNotesDocument, options);
        }
export function useGetNotesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNotesQuery, GetNotesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetNotesQuery, GetNotesQueryVariables>(GetNotesDocument, options);
        }
export type GetNotesQueryHookResult = ReturnType<typeof useGetNotesQuery>;
export type GetNotesLazyQueryHookResult = ReturnType<typeof useGetNotesLazyQuery>;
export type GetNotesSuspenseQueryHookResult = ReturnType<typeof useGetNotesSuspenseQuery>;
export type GetNotesQueryResult = Apollo.QueryResult<GetNotesQuery, GetNotesQueryVariables>;
export const GetNoteDocument = gql`
    query GetNote($id: ID!) {
  note(id: $id) {
    id
    title
    content
    labels
    widgetId
    createdAt
    updatedAt
    x
    y
    width
    height
  }
}
    `;

/**
 * __useGetNoteQuery__
 *
 * To run a query within a React component, call `useGetNoteQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNoteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNoteQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetNoteQuery(baseOptions: Apollo.QueryHookOptions<GetNoteQuery, GetNoteQueryVariables> & ({ variables: GetNoteQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNoteQuery, GetNoteQueryVariables>(GetNoteDocument, options);
      }
export function useGetNoteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNoteQuery, GetNoteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNoteQuery, GetNoteQueryVariables>(GetNoteDocument, options);
        }
export function useGetNoteSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNoteQuery, GetNoteQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetNoteQuery, GetNoteQueryVariables>(GetNoteDocument, options);
        }
export type GetNoteQueryHookResult = ReturnType<typeof useGetNoteQuery>;
export type GetNoteLazyQueryHookResult = ReturnType<typeof useGetNoteLazyQuery>;
export type GetNoteSuspenseQueryHookResult = ReturnType<typeof useGetNoteSuspenseQuery>;
export type GetNoteQueryResult = Apollo.QueryResult<GetNoteQuery, GetNoteQueryVariables>;
export const CreateNoteDocument = gql`
    mutation CreateNote($input: CreateNoteInput!) {
  createNote(input: $input) {
    id
    title
    content
    labels
    widgetId
    createdAt
    updatedAt
    x
    y
    width
    height
  }
}
    `;
export type CreateNoteMutationFn = Apollo.MutationFunction<CreateNoteMutation, CreateNoteMutationVariables>;

/**
 * __useCreateNoteMutation__
 *
 * To run a mutation, you first call `useCreateNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createNoteMutation, { data, loading, error }] = useCreateNoteMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateNoteMutation(baseOptions?: Apollo.MutationHookOptions<CreateNoteMutation, CreateNoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateNoteMutation, CreateNoteMutationVariables>(CreateNoteDocument, options);
      }
export type CreateNoteMutationHookResult = ReturnType<typeof useCreateNoteMutation>;
export type CreateNoteMutationResult = Apollo.MutationResult<CreateNoteMutation>;
export type CreateNoteMutationOptions = Apollo.BaseMutationOptions<CreateNoteMutation, CreateNoteMutationVariables>;
export const UpdateNoteDocument = gql`
    mutation UpdateNote($input: UpdateNoteInput!) {
  updateNote(input: $input) {
    id
    title
    content
    labels
    widgetId
    createdAt
    updatedAt
    x
    y
    width
    height
  }
}
    `;
export type UpdateNoteMutationFn = Apollo.MutationFunction<UpdateNoteMutation, UpdateNoteMutationVariables>;

/**
 * __useUpdateNoteMutation__
 *
 * To run a mutation, you first call `useUpdateNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNoteMutation, { data, loading, error }] = useUpdateNoteMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateNoteMutation(baseOptions?: Apollo.MutationHookOptions<UpdateNoteMutation, UpdateNoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateNoteMutation, UpdateNoteMutationVariables>(UpdateNoteDocument, options);
      }
export type UpdateNoteMutationHookResult = ReturnType<typeof useUpdateNoteMutation>;
export type UpdateNoteMutationResult = Apollo.MutationResult<UpdateNoteMutation>;
export type UpdateNoteMutationOptions = Apollo.BaseMutationOptions<UpdateNoteMutation, UpdateNoteMutationVariables>;
export const UpdateNoteLayoutDocument = gql`
    mutation UpdateNoteLayout($input: UpdateNoteLayoutInput!) {
  updateNoteLayout(input: $input) {
    id
    title
    content
    labels
    widgetId
    createdAt
    updatedAt
    x
    y
    width
    height
  }
}
    `;
export type UpdateNoteLayoutMutationFn = Apollo.MutationFunction<UpdateNoteLayoutMutation, UpdateNoteLayoutMutationVariables>;

/**
 * __useUpdateNoteLayoutMutation__
 *
 * To run a mutation, you first call `useUpdateNoteLayoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNoteLayoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNoteLayoutMutation, { data, loading, error }] = useUpdateNoteLayoutMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateNoteLayoutMutation(baseOptions?: Apollo.MutationHookOptions<UpdateNoteLayoutMutation, UpdateNoteLayoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateNoteLayoutMutation, UpdateNoteLayoutMutationVariables>(UpdateNoteLayoutDocument, options);
      }
export type UpdateNoteLayoutMutationHookResult = ReturnType<typeof useUpdateNoteLayoutMutation>;
export type UpdateNoteLayoutMutationResult = Apollo.MutationResult<UpdateNoteLayoutMutation>;
export type UpdateNoteLayoutMutationOptions = Apollo.BaseMutationOptions<UpdateNoteLayoutMutation, UpdateNoteLayoutMutationVariables>;
export const DeleteNoteDocument = gql`
    mutation DeleteNote($id: ID!) {
  deleteNote(id: $id)
}
    `;
export type DeleteNoteMutationFn = Apollo.MutationFunction<DeleteNoteMutation, DeleteNoteMutationVariables>;

/**
 * __useDeleteNoteMutation__
 *
 * To run a mutation, you first call `useDeleteNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteNoteMutation, { data, loading, error }] = useDeleteNoteMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteNoteMutation(baseOptions?: Apollo.MutationHookOptions<DeleteNoteMutation, DeleteNoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteNoteMutation, DeleteNoteMutationVariables>(DeleteNoteDocument, options);
      }
export type DeleteNoteMutationHookResult = ReturnType<typeof useDeleteNoteMutation>;
export type DeleteNoteMutationResult = Apollo.MutationResult<DeleteNoteMutation>;
export type DeleteNoteMutationOptions = Apollo.BaseMutationOptions<DeleteNoteMutation, DeleteNoteMutationVariables>;
export const RefreshDocument = gql`
    mutation Refresh {
  refresh {
    message
  }
}
    `;
export type RefreshMutationFn = Apollo.MutationFunction<RefreshMutation, RefreshMutationVariables>;

/**
 * __useRefreshMutation__
 *
 * To run a mutation, you first call `useRefreshMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshMutation, { data, loading, error }] = useRefreshMutation({
 *   variables: {
 *   },
 * });
 */
export function useRefreshMutation(baseOptions?: Apollo.MutationHookOptions<RefreshMutation, RefreshMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RefreshMutation, RefreshMutationVariables>(RefreshDocument, options);
      }
export type RefreshMutationHookResult = ReturnType<typeof useRefreshMutation>;
export type RefreshMutationResult = Apollo.MutationResult<RefreshMutation>;
export type RefreshMutationOptions = Apollo.BaseMutationOptions<RefreshMutation, RefreshMutationVariables>;
export const GetWidgetsDocument = gql`
    query GetWidgets($userId: ID!) {
  widgets(userId: $userId) {
    id
    type
    title
    x
    y
    width
    height
    backgroundColor
    textColor
    iconColor
    backgroundImage
    config {
      ... on ClockConfig {
        timezone
        format
      }
      ... on WeatherConfig {
        location
        units
      }
      ... on NotesConfig {
        maxLength
        visibleLabels
        showGrid
        gridColumns
      }
      ... on TasksConfig {
        categories
        defaultCategory
      }
    }
  }
}
    `;

/**
 * __useGetWidgetsQuery__
 *
 * To run a query within a React component, call `useGetWidgetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWidgetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWidgetsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetWidgetsQuery(baseOptions: Apollo.QueryHookOptions<GetWidgetsQuery, GetWidgetsQueryVariables> & ({ variables: GetWidgetsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWidgetsQuery, GetWidgetsQueryVariables>(GetWidgetsDocument, options);
      }
export function useGetWidgetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWidgetsQuery, GetWidgetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWidgetsQuery, GetWidgetsQueryVariables>(GetWidgetsDocument, options);
        }
export function useGetWidgetsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWidgetsQuery, GetWidgetsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWidgetsQuery, GetWidgetsQueryVariables>(GetWidgetsDocument, options);
        }
export type GetWidgetsQueryHookResult = ReturnType<typeof useGetWidgetsQuery>;
export type GetWidgetsLazyQueryHookResult = ReturnType<typeof useGetWidgetsLazyQuery>;
export type GetWidgetsSuspenseQueryHookResult = ReturnType<typeof useGetWidgetsSuspenseQuery>;
export type GetWidgetsQueryResult = Apollo.QueryResult<GetWidgetsQuery, GetWidgetsQueryVariables>;
export const GetWidgetDocument = gql`
    query GetWidget($id: ID!) {
  widget(id: $id) {
    id
    type
    title
    x
    y
    width
    height
    backgroundColor
    textColor
    iconColor
    backgroundImage
    config {
      ... on ClockConfig {
        timezone
        format
      }
      ... on WeatherConfig {
        location
        units
      }
      ... on NotesConfig {
        maxLength
        visibleLabels
        showGrid
        gridColumns
      }
      ... on TasksConfig {
        categories
        defaultCategory
      }
    }
  }
}
    `;

/**
 * __useGetWidgetQuery__
 *
 * To run a query within a React component, call `useGetWidgetQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWidgetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWidgetQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetWidgetQuery(baseOptions: Apollo.QueryHookOptions<GetWidgetQuery, GetWidgetQueryVariables> & ({ variables: GetWidgetQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWidgetQuery, GetWidgetQueryVariables>(GetWidgetDocument, options);
      }
export function useGetWidgetLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWidgetQuery, GetWidgetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWidgetQuery, GetWidgetQueryVariables>(GetWidgetDocument, options);
        }
export function useGetWidgetSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWidgetQuery, GetWidgetQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWidgetQuery, GetWidgetQueryVariables>(GetWidgetDocument, options);
        }
export type GetWidgetQueryHookResult = ReturnType<typeof useGetWidgetQuery>;
export type GetWidgetLazyQueryHookResult = ReturnType<typeof useGetWidgetLazyQuery>;
export type GetWidgetSuspenseQueryHookResult = ReturnType<typeof useGetWidgetSuspenseQuery>;
export type GetWidgetQueryResult = Apollo.QueryResult<GetWidgetQuery, GetWidgetQueryVariables>;
export const GetWidgetsByTypeDocument = gql`
    query GetWidgetsByType($type: String!) {
  widgetsByType(type: $type) {
    id
    type
    title
    x
    y
    width
    height
    backgroundColor
    textColor
    iconColor
    backgroundImage
    config {
      ... on ClockConfig {
        timezone
        format
      }
      ... on WeatherConfig {
        location
        units
      }
      ... on NotesConfig {
        maxLength
        visibleLabels
        showGrid
        gridColumns
      }
      ... on TasksConfig {
        categories
        defaultCategory
      }
    }
  }
}
    `;

/**
 * __useGetWidgetsByTypeQuery__
 *
 * To run a query within a React component, call `useGetWidgetsByTypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWidgetsByTypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWidgetsByTypeQuery({
 *   variables: {
 *      type: // value for 'type'
 *   },
 * });
 */
export function useGetWidgetsByTypeQuery(baseOptions: Apollo.QueryHookOptions<GetWidgetsByTypeQuery, GetWidgetsByTypeQueryVariables> & ({ variables: GetWidgetsByTypeQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWidgetsByTypeQuery, GetWidgetsByTypeQueryVariables>(GetWidgetsByTypeDocument, options);
      }
export function useGetWidgetsByTypeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWidgetsByTypeQuery, GetWidgetsByTypeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWidgetsByTypeQuery, GetWidgetsByTypeQueryVariables>(GetWidgetsByTypeDocument, options);
        }
export function useGetWidgetsByTypeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWidgetsByTypeQuery, GetWidgetsByTypeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWidgetsByTypeQuery, GetWidgetsByTypeQueryVariables>(GetWidgetsByTypeDocument, options);
        }
export type GetWidgetsByTypeQueryHookResult = ReturnType<typeof useGetWidgetsByTypeQuery>;
export type GetWidgetsByTypeLazyQueryHookResult = ReturnType<typeof useGetWidgetsByTypeLazyQuery>;
export type GetWidgetsByTypeSuspenseQueryHookResult = ReturnType<typeof useGetWidgetsByTypeSuspenseQuery>;
export type GetWidgetsByTypeQueryResult = Apollo.QueryResult<GetWidgetsByTypeQuery, GetWidgetsByTypeQueryVariables>;
export const GetAvailableWidgetTypesDocument = gql`
    query GetAvailableWidgetTypes {
  availableWidgetTypes
}
    `;

/**
 * __useGetAvailableWidgetTypesQuery__
 *
 * To run a query within a React component, call `useGetAvailableWidgetTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAvailableWidgetTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAvailableWidgetTypesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAvailableWidgetTypesQuery(baseOptions?: Apollo.QueryHookOptions<GetAvailableWidgetTypesQuery, GetAvailableWidgetTypesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAvailableWidgetTypesQuery, GetAvailableWidgetTypesQueryVariables>(GetAvailableWidgetTypesDocument, options);
      }
export function useGetAvailableWidgetTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAvailableWidgetTypesQuery, GetAvailableWidgetTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAvailableWidgetTypesQuery, GetAvailableWidgetTypesQueryVariables>(GetAvailableWidgetTypesDocument, options);
        }
export function useGetAvailableWidgetTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAvailableWidgetTypesQuery, GetAvailableWidgetTypesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAvailableWidgetTypesQuery, GetAvailableWidgetTypesQueryVariables>(GetAvailableWidgetTypesDocument, options);
        }
export type GetAvailableWidgetTypesQueryHookResult = ReturnType<typeof useGetAvailableWidgetTypesQuery>;
export type GetAvailableWidgetTypesLazyQueryHookResult = ReturnType<typeof useGetAvailableWidgetTypesLazyQuery>;
export type GetAvailableWidgetTypesSuspenseQueryHookResult = ReturnType<typeof useGetAvailableWidgetTypesSuspenseQuery>;
export type GetAvailableWidgetTypesQueryResult = Apollo.QueryResult<GetAvailableWidgetTypesQuery, GetAvailableWidgetTypesQueryVariables>;
export const CreateWidgetDocument = gql`
    mutation CreateWidget($userId: ID!, $input: CreateWidgetInput!) {
  createWidget(userId: $userId, input: $input) {
    id
    type
    title
    x
    y
    width
    height
    backgroundColor
    textColor
    iconColor
    backgroundImage
    config {
      ... on ClockConfig {
        timezone
        format
      }
      ... on WeatherConfig {
        location
        units
      }
      ... on NotesConfig {
        maxLength
        visibleLabels
        showGrid
        gridColumns
      }
      ... on TasksConfig {
        categories
        defaultCategory
      }
    }
  }
}
    `;
export type CreateWidgetMutationFn = Apollo.MutationFunction<CreateWidgetMutation, CreateWidgetMutationVariables>;

/**
 * __useCreateWidgetMutation__
 *
 * To run a mutation, you first call `useCreateWidgetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWidgetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWidgetMutation, { data, loading, error }] = useCreateWidgetMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateWidgetMutation(baseOptions?: Apollo.MutationHookOptions<CreateWidgetMutation, CreateWidgetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWidgetMutation, CreateWidgetMutationVariables>(CreateWidgetDocument, options);
      }
export type CreateWidgetMutationHookResult = ReturnType<typeof useCreateWidgetMutation>;
export type CreateWidgetMutationResult = Apollo.MutationResult<CreateWidgetMutation>;
export type CreateWidgetMutationOptions = Apollo.BaseMutationOptions<CreateWidgetMutation, CreateWidgetMutationVariables>;
export const UpdateWidgetDocument = gql`
    mutation UpdateWidget($input: UpdateWidgetInput!) {
  updateWidget(input: $input) {
    id
    type
    title
    x
    y
    width
    height
    backgroundColor
    textColor
    iconColor
    backgroundImage
    config {
      ... on ClockConfig {
        timezone
        format
      }
      ... on WeatherConfig {
        location
        units
      }
      ... on NotesConfig {
        maxLength
        visibleLabels
        showGrid
        gridColumns
      }
      ... on TasksConfig {
        categories
        defaultCategory
      }
    }
  }
}
    `;
export type UpdateWidgetMutationFn = Apollo.MutationFunction<UpdateWidgetMutation, UpdateWidgetMutationVariables>;

/**
 * __useUpdateWidgetMutation__
 *
 * To run a mutation, you first call `useUpdateWidgetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWidgetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWidgetMutation, { data, loading, error }] = useUpdateWidgetMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateWidgetMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWidgetMutation, UpdateWidgetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWidgetMutation, UpdateWidgetMutationVariables>(UpdateWidgetDocument, options);
      }
export type UpdateWidgetMutationHookResult = ReturnType<typeof useUpdateWidgetMutation>;
export type UpdateWidgetMutationResult = Apollo.MutationResult<UpdateWidgetMutation>;
export type UpdateWidgetMutationOptions = Apollo.BaseMutationOptions<UpdateWidgetMutation, UpdateWidgetMutationVariables>;
export const UpdateWidgetLayoutDocument = gql`
    mutation UpdateWidgetLayout($input: UpdateWidgetLayoutInput!) {
  updateWidgetLayout(input: $input) {
    id
    type
    title
    x
    y
    width
    height
    backgroundColor
    textColor
    iconColor
    backgroundImage
    config {
      ... on ClockConfig {
        timezone
        format
      }
      ... on WeatherConfig {
        location
        units
      }
      ... on NotesConfig {
        maxLength
        visibleLabels
        showGrid
        gridColumns
      }
      ... on TasksConfig {
        categories
        defaultCategory
      }
    }
  }
}
    `;
export type UpdateWidgetLayoutMutationFn = Apollo.MutationFunction<UpdateWidgetLayoutMutation, UpdateWidgetLayoutMutationVariables>;

/**
 * __useUpdateWidgetLayoutMutation__
 *
 * To run a mutation, you first call `useUpdateWidgetLayoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWidgetLayoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWidgetLayoutMutation, { data, loading, error }] = useUpdateWidgetLayoutMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateWidgetLayoutMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWidgetLayoutMutation, UpdateWidgetLayoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWidgetLayoutMutation, UpdateWidgetLayoutMutationVariables>(UpdateWidgetLayoutDocument, options);
      }
export type UpdateWidgetLayoutMutationHookResult = ReturnType<typeof useUpdateWidgetLayoutMutation>;
export type UpdateWidgetLayoutMutationResult = Apollo.MutationResult<UpdateWidgetLayoutMutation>;
export type UpdateWidgetLayoutMutationOptions = Apollo.BaseMutationOptions<UpdateWidgetLayoutMutation, UpdateWidgetLayoutMutationVariables>;
export const DeleteWidgetDocument = gql`
    mutation DeleteWidget($id: ID!) {
  deleteWidget(id: $id)
}
    `;
export type DeleteWidgetMutationFn = Apollo.MutationFunction<DeleteWidgetMutation, DeleteWidgetMutationVariables>;

/**
 * __useDeleteWidgetMutation__
 *
 * To run a mutation, you first call `useDeleteWidgetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWidgetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWidgetMutation, { data, loading, error }] = useDeleteWidgetMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteWidgetMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWidgetMutation, DeleteWidgetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWidgetMutation, DeleteWidgetMutationVariables>(DeleteWidgetDocument, options);
      }
export type DeleteWidgetMutationHookResult = ReturnType<typeof useDeleteWidgetMutation>;
export type DeleteWidgetMutationResult = Apollo.MutationResult<DeleteWidgetMutation>;
export type DeleteWidgetMutationOptions = Apollo.BaseMutationOptions<DeleteWidgetMutation, DeleteWidgetMutationVariables>;