export const PriceTiers = Object.freeze(['Bronze - $199.95', 'Silver - $299.95', 'Gold - $399.95'] as const);
export const Sessions = Object.freeze(['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5'] as const);
export const OvernightStayOptions = Object.freeze(['Yes', 'No'] as const);
export const RequiredFields = Object.freeze(['firstName', 'lastName', 'email', 'priceTier', 'sessions', 'overnightStay'] as const);

export type PriceTier = typeof PriceTiers[number];
export type Session = typeof Sessions[number];
export type OvernightStayOption = typeof OvernightStayOptions[number];
export type RequiredField = typeof RequiredFields[number];

export type ContactFormInfo = {
    firstName?: string;
    lastName?: string;
    email?: string;
    priceTier?: PriceTier;
    sessions?: Session[];
    overnightStay?: OvernightStayOption;
    receiveEmailUpdates?: boolean;
    comments?: string;
};
