// utils/cardGenerator.ts
export function generateCardNumber(length = 16): string {
  const randomDigits = () => Math.floor(Math.random() * 10);
  let cardNum = Array.from({ length: length - 1 }, () => randomDigits()).join(
    ''
  );
  // Compute check‑digit with Luhn algorithm
  const checkDigit = computeLuhnCheckDigit(cardNum);
  cardNum += checkDigit.toString();
  return cardNum;
}

function computeLuhnCheckDigit(partial: string): number {
  const digits = partial.split('').map((d) => parseInt(d, 10));
  // starting from rightmost (but excluding check digit) double every second digit
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if ((digits.length - i) % 2 === 1) {
      d = d * 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  const mod10 = sum % 10;
  return (10 - mod10) % 10;
}

export function generateExpirationDate(yearsValid = 4): {
  month: string;
  year: string;
} {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = (now.getFullYear() + yearsValid).toString();
  return { month, year };
}

export function generateCvv(length = 3): string {
  let cvv = '';
  for (let i = 0; i < length; i++) {
    cvv += Math.floor(Math.random() * 10).toString();
  }
  return cvv;
}
