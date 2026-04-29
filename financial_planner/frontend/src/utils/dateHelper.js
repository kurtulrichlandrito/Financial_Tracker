export default function getDatePresetISO(type) {
    const now = new Date();

    switch (type) {
        case "this_month": {
            return (new Date(now.getFullYear(), now.getMonth(), 1)).toISOString().split("T")[0];
        }

        case "last_month": {
            return new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
        }

        case "last_3_months": {
            return new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split("T")[0];
        }

        case "this_year": {
            return new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
        }

        default:
            return "";
    }
}