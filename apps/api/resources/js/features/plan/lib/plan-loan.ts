import { type LoanSimulationResult } from './plan-cost-types';

export function calculateLoanPayment(
    totalMan: number,
    downMan: number,
    ratePercent: number,
    years: number,
): LoanSimulationResult {
    const principal = Math.max(0, totalMan - Math.max(0, downMan)) * 10000;
    const r = (ratePercent >= 0 ? ratePercent : 0.7) / 100 / 12;
    const nMonths = Math.max(1, years) * 12;

    if (principal <= 0) {
        return {
            monthlyPayment: 0,
            principal: 0,
            totalPayment: 0,
            interest: 0,
        };
    }

    const monthly =
        r === 0
            ? principal / nMonths
            : (principal * r * Math.pow(1 + r, nMonths)) /
              (Math.pow(1 + r, nMonths) - 1);

    const roundedMonthly = Math.round(monthly);
    const totalPayment = roundedMonthly * nMonths;
    const interest = totalPayment - principal;

    return {
        monthlyPayment: roundedMonthly,
        principal,
        totalPayment,
        interest,
    };
}
