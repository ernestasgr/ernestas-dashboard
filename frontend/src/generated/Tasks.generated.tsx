/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Types from './types';

import * as Apollo from '@apollo/client';
import { gql } from '@apollo/client';
const defaultOptions = {} as const;
export type GetTaskHierarchyQueryVariables = Types.Exact<{
    filter?: Types.InputMaybe<Types.TasksFilterInput>;
}>;

export interface GetTaskHierarchyQuery {
    __typename?: 'Query';
    taskHierarchy: {
        __typename?: 'TaskType';
        id: string;
        text: string;
        completed: boolean;
        category: string;
        userId: string;
        widgetId?: string | null;
        createdAt: any;
        updatedAt: any;
        priority: number;
        dueDate?: any | null;
        description?: string | null;
        parentTaskId?: number | null;
        displayOrder: number;
        subTasks?:
            | {
                  __typename?: 'TaskType';
                  id: string;
                  text: string;
                  completed: boolean;
                  category: string;
                  userId: string;
                  widgetId?: string | null;
                  createdAt: any;
                  updatedAt: any;
                  priority: number;
                  dueDate?: any | null;
                  description?: string | null;
                  parentTaskId?: number | null;
                  displayOrder: number;
                  subTasks?:
                      | {
                            __typename?: 'TaskType';
                            id: string;
                            text: string;
                            completed: boolean;
                            category: string;
                            userId: string;
                            widgetId?: string | null;
                            createdAt: any;
                            updatedAt: any;
                            priority: number;
                            dueDate?: any | null;
                            description?: string | null;
                            parentTaskId?: number | null;
                            displayOrder: number;
                            subTasks?:
                                | {
                                      __typename?: 'TaskType';
                                      id: string;
                                      text: string;
                                      completed: boolean;
                                      category: string;
                                      userId: string;
                                      widgetId?: string | null;
                                      createdAt: any;
                                      updatedAt: any;
                                      priority: number;
                                      dueDate?: any | null;
                                      description?: string | null;
                                      parentTaskId?: number | null;
                                      displayOrder: number;
                                  }[]
                                | null;
                        }[]
                      | null;
              }[]
            | null;
    }[];
}

export type GetTaskQueryVariables = Types.Exact<{
    id: Types.Scalars['Int']['input'];
}>;

export interface GetTaskQuery {
    __typename?: 'Query';
    task?: {
        __typename?: 'TaskType';
        id: string;
        text: string;
        completed: boolean;
        category: string;
        userId: string;
        widgetId?: string | null;
        createdAt: any;
        updatedAt: any;
        priority: number;
        dueDate?: any | null;
        description?: string | null;
        parentTaskId?: number | null;
        displayOrder: number;
        subTasks?:
            | {
                  __typename?: 'TaskType';
                  id: string;
                  text: string;
                  completed: boolean;
                  category: string;
                  userId: string;
                  widgetId?: string | null;
                  createdAt: any;
                  updatedAt: any;
                  priority: number;
                  dueDate?: any | null;
                  description?: string | null;
                  parentTaskId?: number | null;
                  displayOrder: number;
              }[]
            | null;
    } | null;
}

export type GetTaskCategoriesQueryVariables = Types.Exact<
    Record<string, never>
>;

export interface GetTaskCategoriesQuery {
    __typename?: 'Query';
    taskCategories: string[];
}

export type CreateTaskMutationVariables = Types.Exact<{
    input: Types.CreateTaskInput;
}>;

export interface CreateTaskMutation {
    __typename?: 'Mutation';
    createTask: {
        __typename?: 'TaskType';
        id: string;
        text: string;
        completed: boolean;
        category: string;
        userId: string;
        widgetId?: string | null;
        createdAt: any;
        updatedAt: any;
        priority: number;
        dueDate?: any | null;
        description?: string | null;
        parentTaskId?: number | null;
        displayOrder: number;
    };
}

export type UpdateTaskMutationVariables = Types.Exact<{
    input: Types.UpdateTaskInput;
}>;

export interface UpdateTaskMutation {
    __typename?: 'Mutation';
    updateTask?: {
        __typename?: 'TaskType';
        id: string;
        text: string;
        completed: boolean;
        category: string;
        userId: string;
        widgetId?: string | null;
        createdAt: any;
        updatedAt: any;
        priority: number;
        dueDate?: any | null;
        description?: string | null;
        parentTaskId?: number | null;
        displayOrder: number;
    } | null;
}

export type ToggleTaskCompletionMutationVariables = Types.Exact<{
    id: Types.Scalars['Int']['input'];
}>;

export interface ToggleTaskCompletionMutation {
    __typename?: 'Mutation';
    toggleTaskCompletion?: {
        __typename?: 'TaskType';
        id: string;
        text: string;
        completed: boolean;
        category: string;
        userId: string;
        widgetId?: string | null;
        createdAt: any;
        updatedAt: any;
        priority: number;
        dueDate?: any | null;
        description?: string | null;
        parentTaskId?: number | null;
        displayOrder: number;
    } | null;
}

export type DeleteTaskMutationVariables = Types.Exact<{
    id: Types.Scalars['Int']['input'];
}>;

export interface DeleteTaskMutation {
    __typename?: 'Mutation';
    deleteTask: boolean;
}

export type ReorderTaskMutationVariables = Types.Exact<{
    input: Types.ReorderTaskInput;
}>;

export interface ReorderTaskMutation {
    __typename?: 'Mutation';
    reorderTask?: {
        __typename?: 'TaskType';
        id: string;
        text: string;
        completed: boolean;
        category: string;
        userId: string;
        widgetId?: string | null;
        createdAt: any;
        updatedAt: any;
        priority: number;
        dueDate?: any | null;
        description?: string | null;
        parentTaskId?: number | null;
        displayOrder: number;
    } | null;
}

export const GetTaskHierarchyDocument = gql`
    query GetTaskHierarchy($filter: TasksFilterInput) {
        taskHierarchy(filter: $filter) {
            id
            text
            completed
            category
            userId
            widgetId
            createdAt
            updatedAt
            priority
            dueDate
            description
            parentTaskId
            displayOrder
            subTasks {
                id
                text
                completed
                category
                userId
                widgetId
                createdAt
                updatedAt
                priority
                dueDate
                description
                parentTaskId
                displayOrder
                subTasks {
                    id
                    text
                    completed
                    category
                    userId
                    widgetId
                    createdAt
                    updatedAt
                    priority
                    dueDate
                    description
                    parentTaskId
                    displayOrder
                    subTasks {
                        id
                        text
                        completed
                        category
                        userId
                        widgetId
                        createdAt
                        updatedAt
                        priority
                        dueDate
                        description
                        parentTaskId
                        displayOrder
                    }
                }
            }
        }
    }
`;

/**
 * __useGetTaskHierarchyQuery__
 *
 * To run a query within a React component, call `useGetTaskHierarchyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTaskHierarchyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTaskHierarchyQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetTaskHierarchyQuery(
    baseOptions?: Apollo.QueryHookOptions<
        GetTaskHierarchyQuery,
        GetTaskHierarchyQueryVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<
        GetTaskHierarchyQuery,
        GetTaskHierarchyQueryVariables
    >(GetTaskHierarchyDocument, options);
}
export function useGetTaskHierarchyLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        GetTaskHierarchyQuery,
        GetTaskHierarchyQueryVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<
        GetTaskHierarchyQuery,
        GetTaskHierarchyQueryVariables
    >(GetTaskHierarchyDocument, options);
}
export function useGetTaskHierarchySuspenseQuery(
    baseOptions?:
        | Apollo.SkipToken
        | Apollo.SuspenseQueryHookOptions<
              GetTaskHierarchyQuery,
              GetTaskHierarchyQueryVariables
          >,
) {
    const options =
        baseOptions === Apollo.skipToken
            ? baseOptions
            : { ...defaultOptions, ...baseOptions };
    return Apollo.useSuspenseQuery<
        GetTaskHierarchyQuery,
        GetTaskHierarchyQueryVariables
    >(GetTaskHierarchyDocument, options);
}
export type GetTaskHierarchyQueryHookResult = ReturnType<
    typeof useGetTaskHierarchyQuery
>;
export type GetTaskHierarchyLazyQueryHookResult = ReturnType<
    typeof useGetTaskHierarchyLazyQuery
>;
export type GetTaskHierarchySuspenseQueryHookResult = ReturnType<
    typeof useGetTaskHierarchySuspenseQuery
>;
export type GetTaskHierarchyQueryResult = Apollo.QueryResult<
    GetTaskHierarchyQuery,
    GetTaskHierarchyQueryVariables
>;
export const GetTaskDocument = gql`
    query GetTask($id: Int!) {
        task(id: $id) {
            id
            text
            completed
            category
            userId
            widgetId
            createdAt
            updatedAt
            priority
            dueDate
            description
            parentTaskId
            displayOrder
            subTasks {
                id
                text
                completed
                category
                userId
                widgetId
                createdAt
                updatedAt
                priority
                dueDate
                description
                parentTaskId
                displayOrder
            }
        }
    }
`;

/**
 * __useGetTaskQuery__
 *
 * To run a query within a React component, call `useGetTaskQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTaskQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTaskQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTaskQuery(
    baseOptions: Apollo.QueryHookOptions<GetTaskQuery, GetTaskQueryVariables> &
        (
            | { variables: GetTaskQueryVariables; skip?: boolean }
            | { skip: boolean }
        ),
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<GetTaskQuery, GetTaskQueryVariables>(
        GetTaskDocument,
        options,
    );
}
export function useGetTaskLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        GetTaskQuery,
        GetTaskQueryVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<GetTaskQuery, GetTaskQueryVariables>(
        GetTaskDocument,
        options,
    );
}
export function useGetTaskSuspenseQuery(
    baseOptions?:
        | Apollo.SkipToken
        | Apollo.SuspenseQueryHookOptions<GetTaskQuery, GetTaskQueryVariables>,
) {
    const options =
        baseOptions === Apollo.skipToken
            ? baseOptions
            : { ...defaultOptions, ...baseOptions };
    return Apollo.useSuspenseQuery<GetTaskQuery, GetTaskQueryVariables>(
        GetTaskDocument,
        options,
    );
}
export type GetTaskQueryHookResult = ReturnType<typeof useGetTaskQuery>;
export type GetTaskLazyQueryHookResult = ReturnType<typeof useGetTaskLazyQuery>;
export type GetTaskSuspenseQueryHookResult = ReturnType<
    typeof useGetTaskSuspenseQuery
>;
export type GetTaskQueryResult = Apollo.QueryResult<
    GetTaskQuery,
    GetTaskQueryVariables
>;
export const GetTaskCategoriesDocument = gql`
    query GetTaskCategories {
        taskCategories
    }
`;

/**
 * __useGetTaskCategoriesQuery__
 *
 * To run a query within a React component, call `useGetTaskCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTaskCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTaskCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTaskCategoriesQuery(
    baseOptions?: Apollo.QueryHookOptions<
        GetTaskCategoriesQuery,
        GetTaskCategoriesQueryVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<
        GetTaskCategoriesQuery,
        GetTaskCategoriesQueryVariables
    >(GetTaskCategoriesDocument, options);
}
export function useGetTaskCategoriesLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        GetTaskCategoriesQuery,
        GetTaskCategoriesQueryVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<
        GetTaskCategoriesQuery,
        GetTaskCategoriesQueryVariables
    >(GetTaskCategoriesDocument, options);
}
export function useGetTaskCategoriesSuspenseQuery(
    baseOptions?:
        | Apollo.SkipToken
        | Apollo.SuspenseQueryHookOptions<
              GetTaskCategoriesQuery,
              GetTaskCategoriesQueryVariables
          >,
) {
    const options =
        baseOptions === Apollo.skipToken
            ? baseOptions
            : { ...defaultOptions, ...baseOptions };
    return Apollo.useSuspenseQuery<
        GetTaskCategoriesQuery,
        GetTaskCategoriesQueryVariables
    >(GetTaskCategoriesDocument, options);
}
export type GetTaskCategoriesQueryHookResult = ReturnType<
    typeof useGetTaskCategoriesQuery
>;
export type GetTaskCategoriesLazyQueryHookResult = ReturnType<
    typeof useGetTaskCategoriesLazyQuery
>;
export type GetTaskCategoriesSuspenseQueryHookResult = ReturnType<
    typeof useGetTaskCategoriesSuspenseQuery
>;
export type GetTaskCategoriesQueryResult = Apollo.QueryResult<
    GetTaskCategoriesQuery,
    GetTaskCategoriesQueryVariables
>;
export const CreateTaskDocument = gql`
    mutation CreateTask($input: CreateTaskInput!) {
        createTask(input: $input) {
            id
            text
            completed
            category
            userId
            widgetId
            createdAt
            updatedAt
            priority
            dueDate
            description
            parentTaskId
            displayOrder
        }
    }
`;
export type CreateTaskMutationFn = Apollo.MutationFunction<
    CreateTaskMutation,
    CreateTaskMutationVariables
>;

/**
 * __useCreateTaskMutation__
 *
 * To run a mutation, you first call `useCreateTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTaskMutation, { data, loading, error }] = useCreateTaskMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTaskMutation(
    baseOptions?: Apollo.MutationHookOptions<
        CreateTaskMutation,
        CreateTaskMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<CreateTaskMutation, CreateTaskMutationVariables>(
        CreateTaskDocument,
        options,
    );
}
export type CreateTaskMutationHookResult = ReturnType<
    typeof useCreateTaskMutation
>;
export type CreateTaskMutationResult =
    Apollo.MutationResult<CreateTaskMutation>;
export type CreateTaskMutationOptions = Apollo.BaseMutationOptions<
    CreateTaskMutation,
    CreateTaskMutationVariables
>;
export const UpdateTaskDocument = gql`
    mutation UpdateTask($input: UpdateTaskInput!) {
        updateTask(input: $input) {
            id
            text
            completed
            category
            userId
            widgetId
            createdAt
            updatedAt
            priority
            dueDate
            description
            parentTaskId
            displayOrder
        }
    }
`;
export type UpdateTaskMutationFn = Apollo.MutationFunction<
    UpdateTaskMutation,
    UpdateTaskMutationVariables
>;

/**
 * __useUpdateTaskMutation__
 *
 * To run a mutation, you first call `useUpdateTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTaskMutation, { data, loading, error }] = useUpdateTaskMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateTaskMutation(
    baseOptions?: Apollo.MutationHookOptions<
        UpdateTaskMutation,
        UpdateTaskMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<UpdateTaskMutation, UpdateTaskMutationVariables>(
        UpdateTaskDocument,
        options,
    );
}
export type UpdateTaskMutationHookResult = ReturnType<
    typeof useUpdateTaskMutation
>;
export type UpdateTaskMutationResult =
    Apollo.MutationResult<UpdateTaskMutation>;
export type UpdateTaskMutationOptions = Apollo.BaseMutationOptions<
    UpdateTaskMutation,
    UpdateTaskMutationVariables
>;
export const ToggleTaskCompletionDocument = gql`
    mutation ToggleTaskCompletion($id: Int!) {
        toggleTaskCompletion(id: $id) {
            id
            text
            completed
            category
            userId
            widgetId
            createdAt
            updatedAt
            priority
            dueDate
            description
            parentTaskId
            displayOrder
        }
    }
`;
export type ToggleTaskCompletionMutationFn = Apollo.MutationFunction<
    ToggleTaskCompletionMutation,
    ToggleTaskCompletionMutationVariables
>;

/**
 * __useToggleTaskCompletionMutation__
 *
 * To run a mutation, you first call `useToggleTaskCompletionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleTaskCompletionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleTaskCompletionMutation, { data, loading, error }] = useToggleTaskCompletionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useToggleTaskCompletionMutation(
    baseOptions?: Apollo.MutationHookOptions<
        ToggleTaskCompletionMutation,
        ToggleTaskCompletionMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<
        ToggleTaskCompletionMutation,
        ToggleTaskCompletionMutationVariables
    >(ToggleTaskCompletionDocument, options);
}
export type ToggleTaskCompletionMutationHookResult = ReturnType<
    typeof useToggleTaskCompletionMutation
>;
export type ToggleTaskCompletionMutationResult =
    Apollo.MutationResult<ToggleTaskCompletionMutation>;
export type ToggleTaskCompletionMutationOptions = Apollo.BaseMutationOptions<
    ToggleTaskCompletionMutation,
    ToggleTaskCompletionMutationVariables
>;
export const DeleteTaskDocument = gql`
    mutation DeleteTask($id: Int!) {
        deleteTask(id: $id)
    }
`;
export type DeleteTaskMutationFn = Apollo.MutationFunction<
    DeleteTaskMutation,
    DeleteTaskMutationVariables
>;

/**
 * __useDeleteTaskMutation__
 *
 * To run a mutation, you first call `useDeleteTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTaskMutation, { data, loading, error }] = useDeleteTaskMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTaskMutation(
    baseOptions?: Apollo.MutationHookOptions<
        DeleteTaskMutation,
        DeleteTaskMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<DeleteTaskMutation, DeleteTaskMutationVariables>(
        DeleteTaskDocument,
        options,
    );
}
export type DeleteTaskMutationHookResult = ReturnType<
    typeof useDeleteTaskMutation
>;
export type DeleteTaskMutationResult =
    Apollo.MutationResult<DeleteTaskMutation>;
export type DeleteTaskMutationOptions = Apollo.BaseMutationOptions<
    DeleteTaskMutation,
    DeleteTaskMutationVariables
>;
export const ReorderTaskDocument = gql`
    mutation ReorderTask($input: ReorderTaskInput!) {
        reorderTask(input: $input) {
            id
            text
            completed
            category
            userId
            widgetId
            createdAt
            updatedAt
            priority
            dueDate
            description
            parentTaskId
            displayOrder
        }
    }
`;
export type ReorderTaskMutationFn = Apollo.MutationFunction<
    ReorderTaskMutation,
    ReorderTaskMutationVariables
>;

/**
 * __useReorderTaskMutation__
 *
 * To run a mutation, you first call `useReorderTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReorderTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reorderTaskMutation, { data, loading, error }] = useReorderTaskMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useReorderTaskMutation(
    baseOptions?: Apollo.MutationHookOptions<
        ReorderTaskMutation,
        ReorderTaskMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<
        ReorderTaskMutation,
        ReorderTaskMutationVariables
    >(ReorderTaskDocument, options);
}
export type ReorderTaskMutationHookResult = ReturnType<
    typeof useReorderTaskMutation
>;
export type ReorderTaskMutationResult =
    Apollo.MutationResult<ReorderTaskMutation>;
export type ReorderTaskMutationOptions = Apollo.BaseMutationOptions<
    ReorderTaskMutation,
    ReorderTaskMutationVariables
>;
