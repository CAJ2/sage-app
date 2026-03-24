// Ported from @ericblade/quagga2-scanner-example (MIT)
// MIT License
// Copyright (c) 2019 Eric Blade

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
const validationRegex = /^(\d{8,14}|\d{9}[xX])$/
const isOdd = (n: number): boolean => n % 2 === 1
const extractCheckDigit = (code: string): string => code.toUpperCase().at(-1)!

// checksum generator
// UPC:    odd positions * 3, even * 1, left-to-right
// ISBN13: odd positions * 1, even * 3, left-to-right
// GTIN:   reversed (rightmost data digit first), odd * 1, even * 3
const generateChecksumCalculator =
  ({
    evenMult,
    oddMult,
    shouldReverse,
  }: {
    evenMult: number
    oddMult: number
    shouldReverse: boolean
  }) =>
  (str: string): number => {
    const chunks = parseInt(str, 10)
      .toString()
      .split('')
      .map((n: string | number): number => parseInt(String(n), 10))
    if (str.startsWith('0')) chunks.unshift(0)
    const parseChunks = shouldReverse ? [...chunks].reverse() : [...chunks]
    if (shouldReverse) parseChunks.shift()
    else parseChunks.pop()

    let checksum = parseChunks.reduce(
      (acc, n, i) => acc + (isOdd(i) ? n * evenMult : n * oddMult),
      0,
    )
    checksum %= 10
    return checksum === 0 ? 0 : 10 - checksum
  }

const getUpcChecksum = generateChecksumCalculator({ evenMult: 1, oddMult: 3, shouldReverse: false })
const getIsbn13Checksum = generateChecksumCalculator({
  evenMult: 3,
  oddMult: 1,
  shouldReverse: false,
})
const getGtinChecksum = generateChecksumCalculator({ evenMult: 1, oddMult: 3, shouldReverse: true })

const validIsbn10Checksum = (isbn: string): boolean => {
  const chunks = parseInt(isbn, 10)
    .toString()
    .split('')
    .map((n: string | number): number => parseInt(String(n), 10))
  if (extractCheckDigit(isbn) === 'X') chunks.push(10)
  if (isbn.startsWith('0')) chunks.unshift(0)
  const check = chunks.reduce((acc, n, i) => acc + n * (i + 1), 0)
  return check % 11 === 0
}

const validUpcChecksum = (upc: string): boolean => {
  const check = ((n: string | number): number => parseInt(String(n), 10))(extractCheckDigit(upc))
  return getUpcChecksum(upc) === check || getGtinChecksum(upc) === check
}

const validGtinChecksum = (gtin: string): boolean =>
  getGtinChecksum(gtin) ===
  ((n: string | number): number => parseInt(String(n), 10))(extractCheckDigit(gtin))

const validIsbn13Checksum = (isbn: string): boolean =>
  getIsbn13Checksum(isbn) ===
  ((n: string | number): number => parseInt(String(n), 10))(extractCheckDigit(isbn))

const validAsin = (asin: string): boolean => /^(B[\dA-Z]{9}|\d{9}(X|\d))$/.test(asin)

function getTypeOfBarcode(code: string): string {
  switch (code.length) {
    case 10:
      return code.startsWith('B') ? 'asin' : 'isbn10'
    case 12:
      return 'upc'
    case 13:
      return /^(978|979|290|291)\d/.test(code) ? 'isbn13' : 'gtin'
    default:
      return 'gtin'
  }
}

export function validateBarcode(code: string): {
  code: string
  type: string
  valid: boolean
  modifiedCode: string
} {
  let modifiedCode = code.length === 11 ? `0${code}` : code
  let type = getTypeOfBarcode(modifiedCode)

  if (type === 'isbn13') {
    if (modifiedCode.startsWith('290')) {
      const base = modifiedCode.slice(3, -1)
      modifiedCode = `978${base}${getIsbn13Checksum(`978${base}`)}`
    } else if (modifiedCode.startsWith('291')) {
      const base = modifiedCode.slice(3, -1)
      modifiedCode = `979${base}${getIsbn13Checksum(`979${base}`)}`
    }
  }

  const validatorMap: Record<string, (c: string) => boolean> = {
    gtin: validGtinChecksum,
    upc: validUpcChecksum,
    isbn10: validIsbn10Checksum,
    isbn13: validIsbn13Checksum,
    asin: validAsin,
  }

  let valid = false
  if (type !== 'asin' && !validationRegex.test(modifiedCode)) {
    type = 'unknown'
  } else {
    valid = validatorMap[type]?.(modifiedCode) ?? false
  }

  return { code, type, valid, modifiedCode }
}

// confidence filter (used in Scanner)
function getMedian(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const half = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[half]! : (sorted[half - 1]! + sorted[half]!) / 2
}

export function getMedianOfCodeErrors(decodedCodes: { error?: number | null }[]): number {
  const errors = decodedCodes.flatMap((x) =>
    x.error === null ? ([] as number[]) : ([x.error] as number[]),
  )
  return errors.length === 0 ? 1 : getMedian(errors)
}
