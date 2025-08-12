export default function Loading() {
    return (
        <div className='relative min-h-screen overflow-hidden'>
            <div
                aria-hidden
                className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1000px_700px_at_50%_-200px,rgba(59,130,246,0.12),transparent)]'
            />
            <div className='flex min-h-screen flex-col items-center justify-center gap-4 p-6'>
                <div className='bg-accent/60 h-10 w-64 animate-pulse rounded-lg' />
                <div className='bg-accent/50 h-6 w-80 animate-pulse rounded-md' />
            </div>
        </div>
    );
}
