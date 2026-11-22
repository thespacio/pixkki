export type AdoptionPoint = {
    month: string;
    dogs: number;
    cats: number;
};

export type DonationPoint = {
    month: string;
    amount: number;
};

export type OccupancyPoint = {
    week: string;
    rate: number;
};

export type IntakeStatus = "available" | "medical" | "pending" | "adopted";

export type RecentIntake = {
    id: string;
    name: string;
    species: "dog" | "cat";
    breed: string;
    age: string;
    status: IntakeStatus;
    intakeDate: string;
};

export type RecentDonation = {
    name: string;
    amount: number;
    type: string;
    date: string;
};

export const adoptionData: AdoptionPoint[] = [
    { month: "Ene", dogs: 8, cats: 12 },
    { month: "Feb", dogs: 11, cats: 9 },
    { month: "Mar", dogs: 15, cats: 14 },
    { month: "Abr", dogs: 10, cats: 17 },
    { month: "May", dogs: 18, cats: 13 },
    { month: "Jun", dogs: 22, cats: 19 },
    { month: "Jul", dogs: 20, cats: 21 },
    { month: "Ago", dogs: 25, cats: 16 },
    { month: "Sep", dogs: 17, cats: 22 },
    { month: "Oct", dogs: 19, cats: 18 },
    { month: "Nov", dogs: 14, cats: 20 },
    { month: "Dic", dogs: 21, cats: 15 },
];

export const donationData: DonationPoint[] = [
    { month: "Ene", amount: 3200 },
    { month: "Feb", amount: 4800 },
    { month: "Mar", amount: 3900 },
    { month: "Abr", amount: 5200 },
    { month: "May", amount: 6800 },
    { month: "Jun", amount: 5500 },
    { month: "Jul", amount: 7200 },
    { month: "Ago", amount: 6100 },
    { month: "Sep", amount: 8400 },
    { month: "Oct", amount: 7600 },
    { month: "Nov", amount: 9100 },
    { month: "Dic", amount: 11200 },
];

export const occupancyData: OccupancyPoint[] = [
    { week: "S1", rate: 72 },
    { week: "S2", rate: 78 },
    { week: "S3", rate: 85 },
    { week: "S4", rate: 81 },
    { week: "S5", rate: 74 },
    { week: "S6", rate: 68 },
    { week: "S7", rate: 76 },
    { week: "S8", rate: 83 },
];

export const recentIntakes: RecentIntake[] = [
    { id: "A-0241", name: "Mango", species: "dog", breed: "Golden Retriever", age: "3 años", status: "available", intakeDate: "18 dic" },
    { id: "A-0240", name: "Luna", species: "cat", breed: "Doméstico pelo corto", age: "1 año", status: "medical", intakeDate: "17 dic" },
    { id: "A-0239", name: "Biscuit", species: "dog", breed: "Beagle mestizo", age: "5 años", status: "pending", intakeDate: "16 dic" },
    { id: "A-0238", name: "Cleo", species: "cat", breed: "Maine Coon", age: "2 años", status: "available", intakeDate: "15 dic" },
    { id: "A-0237", name: "Bruno", species: "dog", breed: "Labrador mestizo", age: "4 años", status: "adopted", intakeDate: "12 dic" },
];

export const recentDonations: RecentDonation[] = [
    { name: "Sarah Mitchell", amount: 500, type: "Única", date: "20 dic" },
    { name: "The Green Paw Foundation", amount: 2000, type: "Corporativa", date: "19 dic" },
    { name: "James & Elena Park", amount: 150, type: "Mensual", date: "18 dic" },
    { name: "Anónimo", amount: 75, type: "Única", date: "17 dic" },
];
