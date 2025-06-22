import MyGrid from '../../components/dashboard/TestGrid';
import DashboardWelcomeMessage from '../../components/dashboard/WelcomeMessage';

export default function Dashboard() {
    return (
        <div>
            <DashboardWelcomeMessage />
            <MyGrid />
        </div>
    );
}
