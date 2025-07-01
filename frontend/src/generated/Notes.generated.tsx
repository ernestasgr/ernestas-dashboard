/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Types from './types';

import * as Apollo from '@apollo/client';
import { gql } from '@apollo/client';
const defaultOptions = {} as const;
export type GetNotesQueryVariables = Types.Exact<{
    filter: Types.NotesFilterInput;
}>;

export interface GetNotesQuery {
    __typename?: 'Query';
    notes: {
        __typename?: 'NoteType';
        id: string;
        title: string;
        content: string;
        labels: string[];
        widgetId: string;
        createdAt: any;
        updatedAt: any;
        x?: number | null;
        y?: number | null;
        width?: number | null;
        height?: number | null;
        source: string;
        obsidianPath?: string | null;
    }[];
}

export type GetNoteQueryVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
}>;

export interface GetNoteQuery {
    __typename?: 'Query';
    note?: {
        __typename?: 'NoteType';
        id: string;
        title: string;
        content: string;
        labels: string[];
        widgetId: string;
        createdAt: any;
        updatedAt: any;
        x?: number | null;
        y?: number | null;
        width?: number | null;
        height?: number | null;
        source: string;
        obsidianPath?: string | null;
    } | null;
}

export type CreateNoteMutationVariables = Types.Exact<{
    input: Types.CreateNoteInput;
}>;

export interface CreateNoteMutation {
    __typename?: 'Mutation';
    createNote: {
        __typename?: 'NoteType';
        id: string;
        title: string;
        content: string;
        labels: string[];
        widgetId: string;
        createdAt: any;
        updatedAt: any;
        x?: number | null;
        y?: number | null;
        width?: number | null;
        height?: number | null;
        source: string;
        obsidianPath?: string | null;
    };
}

export type CreateNoteWithObsidianSyncMutationVariables = Types.Exact<{
    input: Types.CreateNoteWithObsidianSyncInput;
}>;

export interface CreateNoteWithObsidianSyncMutation {
    __typename?: 'Mutation';
    createNoteWithObsidianSync: {
        __typename?: 'NoteType';
        id: string;
        title: string;
        content: string;
        labels: string[];
        widgetId: string;
        createdAt: any;
        updatedAt: any;
        x?: number | null;
        y?: number | null;
        width?: number | null;
        height?: number | null;
        source: string;
        obsidianPath?: string | null;
    };
}

export type UpdateNoteMutationVariables = Types.Exact<{
    input: Types.UpdateNoteInput;
}>;

export interface UpdateNoteMutation {
    __typename?: 'Mutation';
    updateNote: {
        __typename?: 'NoteType';
        id: string;
        title: string;
        content: string;
        labels: string[];
        widgetId: string;
        createdAt: any;
        updatedAt: any;
        x?: number | null;
        y?: number | null;
        width?: number | null;
        height?: number | null;
        source: string;
        obsidianPath?: string | null;
    };
}

export type UpdateNoteLayoutMutationVariables = Types.Exact<{
    input: Types.UpdateNoteLayoutInput;
}>;

export interface UpdateNoteLayoutMutation {
    __typename?: 'Mutation';
    updateNoteLayout: {
        __typename?: 'NoteType';
        id: string;
        title: string;
        content: string;
        labels: string[];
        widgetId: string;
        createdAt: any;
        updatedAt: any;
        x?: number | null;
        y?: number | null;
        width?: number | null;
        height?: number | null;
        source: string;
        obsidianPath?: string | null;
    };
}

export type DeleteNoteMutationVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
}>;

export interface DeleteNoteMutation {
    __typename?: 'Mutation';
    deleteNote: boolean;
}

export type DeleteNoteWithObsidianSyncMutationVariables = Types.Exact<{
    input: Types.DeleteNoteWithObsidianSyncInput;
}>;

export interface DeleteNoteWithObsidianSyncMutation {
    __typename?: 'Mutation';
    deleteNoteWithObsidianSync: boolean;
}

export type SyncObsidianVaultMutationVariables = Types.Exact<{
    input: Types.ObsidianSyncInput;
}>;

export interface SyncObsidianVaultMutation {
    __typename?: 'Mutation';
    syncObsidianVault: {
        __typename?: 'NoteType';
        id: string;
        title: string;
        content: string;
        labels: string[];
        widgetId: string;
        createdAt: any;
        updatedAt: any;
        x?: number | null;
        y?: number | null;
        width?: number | null;
        height?: number | null;
        source: string;
        obsidianPath?: string | null;
    }[];
}

export type TestObsidianConnectionMutationVariables = Types.Exact<{
    input: Types.ObsidianTestConnectionInput;
}>;

export interface TestObsidianConnectionMutation {
    __typename?: 'Mutation';
    testObsidianConnection: boolean;
}

export type CreateOrUpdateObsidianFileMutationVariables = Types.Exact<{
    input: Types.CreateOrUpdateObsidianFileInput;
}>;

export interface CreateOrUpdateObsidianFileMutation {
    __typename?: 'Mutation';
    createOrUpdateObsidianFile: boolean;
}

export type UpdateNoteWithObsidianSyncMutationVariables = Types.Exact<{
    input: Types.UpdateNoteWithObsidianSyncInput;
}>;

export interface UpdateNoteWithObsidianSyncMutation {
    __typename?: 'Mutation';
    updateNoteWithObsidianSync: {
        __typename?: 'NoteType';
        id: string;
        title: string;
        content: string;
        labels: string[];
        widgetId: string;
        createdAt: any;
        updatedAt: any;
        x?: number | null;
        y?: number | null;
        width?: number | null;
        height?: number | null;
        source: string;
        obsidianPath?: string | null;
    };
}

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
            source
            obsidianPath
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
export function useGetNotesQuery(
    baseOptions: Apollo.QueryHookOptions<
        GetNotesQuery,
        GetNotesQueryVariables
    > &
        (
            | { variables: GetNotesQueryVariables; skip?: boolean }
            | { skip: boolean }
        ),
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<GetNotesQuery, GetNotesQueryVariables>(
        GetNotesDocument,
        options,
    );
}
export function useGetNotesLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        GetNotesQuery,
        GetNotesQueryVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<GetNotesQuery, GetNotesQueryVariables>(
        GetNotesDocument,
        options,
    );
}
export function useGetNotesSuspenseQuery(
    baseOptions?:
        | Apollo.SkipToken
        | Apollo.SuspenseQueryHookOptions<
              GetNotesQuery,
              GetNotesQueryVariables
          >,
) {
    const options =
        baseOptions === Apollo.skipToken
            ? baseOptions
            : { ...defaultOptions, ...baseOptions };
    return Apollo.useSuspenseQuery<GetNotesQuery, GetNotesQueryVariables>(
        GetNotesDocument,
        options,
    );
}
export type GetNotesQueryHookResult = ReturnType<typeof useGetNotesQuery>;
export type GetNotesLazyQueryHookResult = ReturnType<
    typeof useGetNotesLazyQuery
>;
export type GetNotesSuspenseQueryHookResult = ReturnType<
    typeof useGetNotesSuspenseQuery
>;
export type GetNotesQueryResult = Apollo.QueryResult<
    GetNotesQuery,
    GetNotesQueryVariables
>;
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
            source
            obsidianPath
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
export function useGetNoteQuery(
    baseOptions: Apollo.QueryHookOptions<GetNoteQuery, GetNoteQueryVariables> &
        (
            | { variables: GetNoteQueryVariables; skip?: boolean }
            | { skip: boolean }
        ),
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useQuery<GetNoteQuery, GetNoteQueryVariables>(
        GetNoteDocument,
        options,
    );
}
export function useGetNoteLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        GetNoteQuery,
        GetNoteQueryVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useLazyQuery<GetNoteQuery, GetNoteQueryVariables>(
        GetNoteDocument,
        options,
    );
}
export function useGetNoteSuspenseQuery(
    baseOptions?:
        | Apollo.SkipToken
        | Apollo.SuspenseQueryHookOptions<GetNoteQuery, GetNoteQueryVariables>,
) {
    const options =
        baseOptions === Apollo.skipToken
            ? baseOptions
            : { ...defaultOptions, ...baseOptions };
    return Apollo.useSuspenseQuery<GetNoteQuery, GetNoteQueryVariables>(
        GetNoteDocument,
        options,
    );
}
export type GetNoteQueryHookResult = ReturnType<typeof useGetNoteQuery>;
export type GetNoteLazyQueryHookResult = ReturnType<typeof useGetNoteLazyQuery>;
export type GetNoteSuspenseQueryHookResult = ReturnType<
    typeof useGetNoteSuspenseQuery
>;
export type GetNoteQueryResult = Apollo.QueryResult<
    GetNoteQuery,
    GetNoteQueryVariables
>;
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
            source
            obsidianPath
        }
    }
`;
export type CreateNoteMutationFn = Apollo.MutationFunction<
    CreateNoteMutation,
    CreateNoteMutationVariables
>;

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
export function useCreateNoteMutation(
    baseOptions?: Apollo.MutationHookOptions<
        CreateNoteMutation,
        CreateNoteMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<CreateNoteMutation, CreateNoteMutationVariables>(
        CreateNoteDocument,
        options,
    );
}
export type CreateNoteMutationHookResult = ReturnType<
    typeof useCreateNoteMutation
>;
export type CreateNoteMutationResult =
    Apollo.MutationResult<CreateNoteMutation>;
export type CreateNoteMutationOptions = Apollo.BaseMutationOptions<
    CreateNoteMutation,
    CreateNoteMutationVariables
>;
export const CreateNoteWithObsidianSyncDocument = gql`
    mutation CreateNoteWithObsidianSync(
        $input: CreateNoteWithObsidianSyncInput!
    ) {
        createNoteWithObsidianSync(input: $input) {
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
            source
            obsidianPath
        }
    }
`;
export type CreateNoteWithObsidianSyncMutationFn = Apollo.MutationFunction<
    CreateNoteWithObsidianSyncMutation,
    CreateNoteWithObsidianSyncMutationVariables
>;

/**
 * __useCreateNoteWithObsidianSyncMutation__
 *
 * To run a mutation, you first call `useCreateNoteWithObsidianSyncMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateNoteWithObsidianSyncMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createNoteWithObsidianSyncMutation, { data, loading, error }] = useCreateNoteWithObsidianSyncMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateNoteWithObsidianSyncMutation(
    baseOptions?: Apollo.MutationHookOptions<
        CreateNoteWithObsidianSyncMutation,
        CreateNoteWithObsidianSyncMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<
        CreateNoteWithObsidianSyncMutation,
        CreateNoteWithObsidianSyncMutationVariables
    >(CreateNoteWithObsidianSyncDocument, options);
}
export type CreateNoteWithObsidianSyncMutationHookResult = ReturnType<
    typeof useCreateNoteWithObsidianSyncMutation
>;
export type CreateNoteWithObsidianSyncMutationResult =
    Apollo.MutationResult<CreateNoteWithObsidianSyncMutation>;
export type CreateNoteWithObsidianSyncMutationOptions =
    Apollo.BaseMutationOptions<
        CreateNoteWithObsidianSyncMutation,
        CreateNoteWithObsidianSyncMutationVariables
    >;
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
            source
            obsidianPath
        }
    }
`;
export type UpdateNoteMutationFn = Apollo.MutationFunction<
    UpdateNoteMutation,
    UpdateNoteMutationVariables
>;

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
export function useUpdateNoteMutation(
    baseOptions?: Apollo.MutationHookOptions<
        UpdateNoteMutation,
        UpdateNoteMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<UpdateNoteMutation, UpdateNoteMutationVariables>(
        UpdateNoteDocument,
        options,
    );
}
export type UpdateNoteMutationHookResult = ReturnType<
    typeof useUpdateNoteMutation
>;
export type UpdateNoteMutationResult =
    Apollo.MutationResult<UpdateNoteMutation>;
export type UpdateNoteMutationOptions = Apollo.BaseMutationOptions<
    UpdateNoteMutation,
    UpdateNoteMutationVariables
>;
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
            source
            obsidianPath
        }
    }
`;
export type UpdateNoteLayoutMutationFn = Apollo.MutationFunction<
    UpdateNoteLayoutMutation,
    UpdateNoteLayoutMutationVariables
>;

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
export function useUpdateNoteLayoutMutation(
    baseOptions?: Apollo.MutationHookOptions<
        UpdateNoteLayoutMutation,
        UpdateNoteLayoutMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<
        UpdateNoteLayoutMutation,
        UpdateNoteLayoutMutationVariables
    >(UpdateNoteLayoutDocument, options);
}
export type UpdateNoteLayoutMutationHookResult = ReturnType<
    typeof useUpdateNoteLayoutMutation
>;
export type UpdateNoteLayoutMutationResult =
    Apollo.MutationResult<UpdateNoteLayoutMutation>;
export type UpdateNoteLayoutMutationOptions = Apollo.BaseMutationOptions<
    UpdateNoteLayoutMutation,
    UpdateNoteLayoutMutationVariables
>;
export const DeleteNoteDocument = gql`
    mutation DeleteNote($id: ID!) {
        deleteNote(id: $id)
    }
`;
export type DeleteNoteMutationFn = Apollo.MutationFunction<
    DeleteNoteMutation,
    DeleteNoteMutationVariables
>;

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
export function useDeleteNoteMutation(
    baseOptions?: Apollo.MutationHookOptions<
        DeleteNoteMutation,
        DeleteNoteMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<DeleteNoteMutation, DeleteNoteMutationVariables>(
        DeleteNoteDocument,
        options,
    );
}
export type DeleteNoteMutationHookResult = ReturnType<
    typeof useDeleteNoteMutation
>;
export type DeleteNoteMutationResult =
    Apollo.MutationResult<DeleteNoteMutation>;
export type DeleteNoteMutationOptions = Apollo.BaseMutationOptions<
    DeleteNoteMutation,
    DeleteNoteMutationVariables
>;
export const DeleteNoteWithObsidianSyncDocument = gql`
    mutation DeleteNoteWithObsidianSync(
        $input: DeleteNoteWithObsidianSyncInput!
    ) {
        deleteNoteWithObsidianSync(input: $input)
    }
`;
export type DeleteNoteWithObsidianSyncMutationFn = Apollo.MutationFunction<
    DeleteNoteWithObsidianSyncMutation,
    DeleteNoteWithObsidianSyncMutationVariables
>;

/**
 * __useDeleteNoteWithObsidianSyncMutation__
 *
 * To run a mutation, you first call `useDeleteNoteWithObsidianSyncMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteNoteWithObsidianSyncMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteNoteWithObsidianSyncMutation, { data, loading, error }] = useDeleteNoteWithObsidianSyncMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteNoteWithObsidianSyncMutation(
    baseOptions?: Apollo.MutationHookOptions<
        DeleteNoteWithObsidianSyncMutation,
        DeleteNoteWithObsidianSyncMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<
        DeleteNoteWithObsidianSyncMutation,
        DeleteNoteWithObsidianSyncMutationVariables
    >(DeleteNoteWithObsidianSyncDocument, options);
}
export type DeleteNoteWithObsidianSyncMutationHookResult = ReturnType<
    typeof useDeleteNoteWithObsidianSyncMutation
>;
export type DeleteNoteWithObsidianSyncMutationResult =
    Apollo.MutationResult<DeleteNoteWithObsidianSyncMutation>;
export type DeleteNoteWithObsidianSyncMutationOptions =
    Apollo.BaseMutationOptions<
        DeleteNoteWithObsidianSyncMutation,
        DeleteNoteWithObsidianSyncMutationVariables
    >;
export const SyncObsidianVaultDocument = gql`
    mutation SyncObsidianVault($input: ObsidianSyncInput!) {
        syncObsidianVault(input: $input) {
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
            source
            obsidianPath
        }
    }
`;
export type SyncObsidianVaultMutationFn = Apollo.MutationFunction<
    SyncObsidianVaultMutation,
    SyncObsidianVaultMutationVariables
>;

/**
 * __useSyncObsidianVaultMutation__
 *
 * To run a mutation, you first call `useSyncObsidianVaultMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSyncObsidianVaultMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [syncObsidianVaultMutation, { data, loading, error }] = useSyncObsidianVaultMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSyncObsidianVaultMutation(
    baseOptions?: Apollo.MutationHookOptions<
        SyncObsidianVaultMutation,
        SyncObsidianVaultMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<
        SyncObsidianVaultMutation,
        SyncObsidianVaultMutationVariables
    >(SyncObsidianVaultDocument, options);
}
export type SyncObsidianVaultMutationHookResult = ReturnType<
    typeof useSyncObsidianVaultMutation
>;
export type SyncObsidianVaultMutationResult =
    Apollo.MutationResult<SyncObsidianVaultMutation>;
export type SyncObsidianVaultMutationOptions = Apollo.BaseMutationOptions<
    SyncObsidianVaultMutation,
    SyncObsidianVaultMutationVariables
>;
export const TestObsidianConnectionDocument = gql`
    mutation TestObsidianConnection($input: ObsidianTestConnectionInput!) {
        testObsidianConnection(input: $input)
    }
`;
export type TestObsidianConnectionMutationFn = Apollo.MutationFunction<
    TestObsidianConnectionMutation,
    TestObsidianConnectionMutationVariables
>;

/**
 * __useTestObsidianConnectionMutation__
 *
 * To run a mutation, you first call `useTestObsidianConnectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTestObsidianConnectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [testObsidianConnectionMutation, { data, loading, error }] = useTestObsidianConnectionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useTestObsidianConnectionMutation(
    baseOptions?: Apollo.MutationHookOptions<
        TestObsidianConnectionMutation,
        TestObsidianConnectionMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<
        TestObsidianConnectionMutation,
        TestObsidianConnectionMutationVariables
    >(TestObsidianConnectionDocument, options);
}
export type TestObsidianConnectionMutationHookResult = ReturnType<
    typeof useTestObsidianConnectionMutation
>;
export type TestObsidianConnectionMutationResult =
    Apollo.MutationResult<TestObsidianConnectionMutation>;
export type TestObsidianConnectionMutationOptions = Apollo.BaseMutationOptions<
    TestObsidianConnectionMutation,
    TestObsidianConnectionMutationVariables
>;
export const CreateOrUpdateObsidianFileDocument = gql`
    mutation CreateOrUpdateObsidianFile(
        $input: CreateOrUpdateObsidianFileInput!
    ) {
        createOrUpdateObsidianFile(input: $input)
    }
`;
export type CreateOrUpdateObsidianFileMutationFn = Apollo.MutationFunction<
    CreateOrUpdateObsidianFileMutation,
    CreateOrUpdateObsidianFileMutationVariables
>;

/**
 * __useCreateOrUpdateObsidianFileMutation__
 *
 * To run a mutation, you first call `useCreateOrUpdateObsidianFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrUpdateObsidianFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrUpdateObsidianFileMutation, { data, loading, error }] = useCreateOrUpdateObsidianFileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOrUpdateObsidianFileMutation(
    baseOptions?: Apollo.MutationHookOptions<
        CreateOrUpdateObsidianFileMutation,
        CreateOrUpdateObsidianFileMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<
        CreateOrUpdateObsidianFileMutation,
        CreateOrUpdateObsidianFileMutationVariables
    >(CreateOrUpdateObsidianFileDocument, options);
}
export type CreateOrUpdateObsidianFileMutationHookResult = ReturnType<
    typeof useCreateOrUpdateObsidianFileMutation
>;
export type CreateOrUpdateObsidianFileMutationResult =
    Apollo.MutationResult<CreateOrUpdateObsidianFileMutation>;
export type CreateOrUpdateObsidianFileMutationOptions =
    Apollo.BaseMutationOptions<
        CreateOrUpdateObsidianFileMutation,
        CreateOrUpdateObsidianFileMutationVariables
    >;
export const UpdateNoteWithObsidianSyncDocument = gql`
    mutation UpdateNoteWithObsidianSync(
        $input: UpdateNoteWithObsidianSyncInput!
    ) {
        updateNoteWithObsidianSync(input: $input) {
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
            source
            obsidianPath
        }
    }
`;
export type UpdateNoteWithObsidianSyncMutationFn = Apollo.MutationFunction<
    UpdateNoteWithObsidianSyncMutation,
    UpdateNoteWithObsidianSyncMutationVariables
>;

/**
 * __useUpdateNoteWithObsidianSyncMutation__
 *
 * To run a mutation, you first call `useUpdateNoteWithObsidianSyncMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNoteWithObsidianSyncMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNoteWithObsidianSyncMutation, { data, loading, error }] = useUpdateNoteWithObsidianSyncMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateNoteWithObsidianSyncMutation(
    baseOptions?: Apollo.MutationHookOptions<
        UpdateNoteWithObsidianSyncMutation,
        UpdateNoteWithObsidianSyncMutationVariables
    >,
) {
    const options = { ...defaultOptions, ...baseOptions };
    return Apollo.useMutation<
        UpdateNoteWithObsidianSyncMutation,
        UpdateNoteWithObsidianSyncMutationVariables
    >(UpdateNoteWithObsidianSyncDocument, options);
}
export type UpdateNoteWithObsidianSyncMutationHookResult = ReturnType<
    typeof useUpdateNoteWithObsidianSyncMutation
>;
export type UpdateNoteWithObsidianSyncMutationResult =
    Apollo.MutationResult<UpdateNoteWithObsidianSyncMutation>;
export type UpdateNoteWithObsidianSyncMutationOptions =
    Apollo.BaseMutationOptions<
        UpdateNoteWithObsidianSyncMutation,
        UpdateNoteWithObsidianSyncMutationVariables
    >;
