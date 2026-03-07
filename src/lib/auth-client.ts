import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import {
  organizationAc,
  organizationRoles,
} from "#/lib/organization-permissions";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({ ac: organizationAc, roles: organizationRoles }),
  ],
});
