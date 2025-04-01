import { auth } from '../../../auth';
import Navbar from '../components/Navbar';

export default async function Home() {
    const session = await auth();

    return (
        <main>
            <Navbar />
            <p>Hello {session?.user?.name}</p>
        </main>
    );
}
