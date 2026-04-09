import Escrow from './models/Escrow';
import dbConnect from './db';

export async function checkEscrowAccess(
  userId: string,
  escrowId: string,
  requiredRole?: 'client' | 'freelancer'
) {
  await dbConnect();

  const escrow = await Escrow.findById(escrowId);
  if (!escrow) {
    throw Object.assign(new Error('Escrow not found'), { status: 404 });
  }

  const isClient = escrow.clientId === userId;
  const isFreelancer = escrow.freelancerId === userId;

  if (!isClient && !isFreelancer) {
    throw Object.assign(new Error('Access denied: you are not a party to this escrow'), { status: 403 });
  }

  if (requiredRole === 'client' && !isClient) {
    throw Object.assign(new Error('Access denied: client role required'), { status: 403 });
  }

  if (requiredRole === 'freelancer' && !isFreelancer) {
    throw Object.assign(new Error('Access denied: freelancer role required'), { status: 403 });
  }

  return escrow;
}
