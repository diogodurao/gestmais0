
import { paymentService } from './src/services/payment.service';
import { db } from './src/db/index';
import { user } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // Find a manager
    const manager = await db.query.user.findFirst({
        where: eq(user.role, 'manager')
    });

    if (!manager || !manager.activeBuildingId) {
        console.log('No manager with active building found');
        return;
    }

    console.log(`Checking for Manager: ${manager.name} (${manager.id})`);
    console.log(`Building ID: ${manager.activeBuildingId}`);

    console.log('--- RESIDENT STATUS ---');
    const residentStatus = await paymentService.getResidentPaymentStatus(manager.id);
    if (residentStatus.success) {
        console.log('IsBuildingSummary:', residentStatus.data.isBuildingSummary);
        console.log('Message:', residentStatus.data.statusMessage);
        console.log('Unit:', residentStatus.data.apartmentUnit);
    } else {
        console.log('Error:', residentStatus.error);
    }

    console.log('\n--- BUILDING STATUS ---');
    const buildingStatus = await paymentService.getBuildingPaymentStatus(manager.activeBuildingId);
    if (buildingStatus.success) {
        console.log('IsBuildingSummary:', buildingStatus.data.isBuildingSummary);
        console.log('Message:', buildingStatus.data.statusMessage);
        console.log('Unit:', buildingStatus.data.apartmentUnit);
    } else {
        console.log('Error:', buildingStatus.error);
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
