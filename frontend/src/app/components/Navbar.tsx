import { auth, signIn, signOut } from '../../../auth';

const Navbar = async () => {
    const session = await auth();

    return (
        <nav className='bg-gray-800 p-4 text-white'>
            <div className='container mx-auto flex items-center justify-between'>
                <div className='text-lg font-bold'>My Dashboard</div>
                <ul className='flex space-x-4'>
                    {session?.user ? (
                        <form
                            action={async () => {
                                'use server';

                                await signOut({ redirectTo: '/' });
                            }}
                        >
                            <button type='submit'>
                                <span>Logout</span>
                            </button>
                        </form>
                    ) : (
                        <form
                            action={async () => {
                                'use server';

                                await signIn('github');
                            }}
                        >
                            <button type='submit'>
                                <span>Login with GitHub</span>
                            </button>
                        </form>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
