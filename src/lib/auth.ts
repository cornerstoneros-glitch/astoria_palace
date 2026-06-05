/**
 * Module de Contrôle d'Accès et d'Authentification (RBAC)
 * Actuellement désactivé (AUTH_ENABLED = false) pour intégrer sans verrouiller l'interface.
 * Changez AUTH_ENABLED à true pour activer la sécurité stricte sur les APIs et le portail.
 */
export const AUTH_ENABLED = false;

export interface AuthSession {
  userId: string;
  name: string;
  email: string;
  role: "CLIENT" | "STAFF" | "ADMIN";
}

// Session factice d'administrateur par défaut quand l'auth est inactive
export const mockSession: AuthSession = {
  userId: "admin-user-id",
  name: "Directeur Général",
  email: "admin@astoriapalace.ci",
  role: "ADMIN",
};

/**
 * Vérifie si le porteur de la requête dispose des droits requis.
 * Si AUTH_ENABLED = false, retourne toujours true (accès libre).
 */
export async function verifyAccess(
  request: Request,
  requiredRoles: ("CLIENT" | "STAFF" | "ADMIN")[]
): Promise<{ authorized: boolean; session: AuthSession | null }> {
  if (!AUTH_ENABLED) {
    return { authorized: true, session: mockSession };
  }

  // Logique réelle d'authentification par JWT / Cookie de session
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionToken = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("session_token="))
      ?.split("=")[1];

    if (!sessionToken) {
      return { authorized: false, session: null };
    }

    // Dans une implémentation active : décoder le JWT ou interroger Prisma
    // const session = await prisma.user.findFirst({ ... })
    
    // Simulation d'échec si le token n'est pas configuré
    return { authorized: false, session: null };
  } catch (err) {
    return { authorized: false, session: null };
  }
}
