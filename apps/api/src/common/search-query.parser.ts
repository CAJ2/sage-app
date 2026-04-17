export type TokenType =
  | 'WORD'
  | 'STRING'
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'MINUS'
  | 'LPAREN'
  | 'RPAREN'
  | 'SEARCH'
  | 'EXACT'
  | 'LT'
  | 'GT'
  | 'LTE'
  | 'GTE'
  | 'EOF'

export interface Token {
  type: TokenType
  value: string
  start: number
  end: number
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let cursor = 0

  while (cursor < input.length) {
    const char = input[cursor]

    // Whitespace
    if (/\s/.test(char)) {
      cursor++
      continue
    }

    // Connectives & Modifiers (must be whole words, checked later or here)

    // Parentheses
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(', start: cursor, end: cursor + 1 })
      cursor++
      continue
    }
    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')', start: cursor, end: cursor + 1 })
      cursor++
      continue
    }

    // Minus Modifier
    if (char === '-') {
      tokens.push({ type: 'MINUS', value: '-', start: cursor, end: cursor + 1 })
      cursor++
      continue
    }

    // Comparators
    if (char === ':') {
      let type: TokenType = 'SEARCH'
      let value = ':'
      let end = cursor + 1

      if (input[cursor + 1] === '=') {
        type = 'EXACT'
        value = ':='
        end = cursor + 2
      } else if (input[cursor + 1] === '<' && input[cursor + 2] === '=') {
        type = 'LTE'
        value = ':<='
        end = cursor + 3
      } else if (input[cursor + 1] === '>' && input[cursor + 2] === '=') {
        type = 'GTE'
        value = ':>='
        end = cursor + 3
      } else if (input[cursor + 1] === '<') {
        type = 'LT'
        value = ':<'
        end = cursor + 2
      } else if (input[cursor + 1] === '>') {
        type = 'GT'
        value = ':>'
        end = cursor + 2
      }

      tokens.push({ type, value, start: cursor, end })
      cursor = end
      continue
    }

    // Strings
    if (char === '"' || char === "'") {
      const quote = char
      let value = ''
      const start = cursor
      cursor++ // skip quote

      while (cursor < input.length) {
        if (input[cursor] === '\\' && cursor + 1 < input.length) {
          value += input[cursor + 1]
          cursor += 2
        } else if (input[cursor] === quote) {
          cursor++ // skip closing quote
          break
        } else {
          value += input[cursor]
          cursor++
        }
      }

      tokens.push({ type: 'STRING', value, start, end: cursor })
      continue
    }

    // Words
    let value = ''
    const start = cursor
    while (
      cursor < input.length &&
      !/\s/.test(input[cursor]) &&
      input[cursor] !== '(' &&
      input[cursor] !== ')' &&
      input[cursor] !== ':' &&
      input[cursor] !== '"' &&
      input[cursor] !== "'"
    ) {
      if (input[cursor] === '\\' && cursor + 1 < input.length) {
        value += input[cursor + 1]
        cursor += 2
      } else {
        value += input[cursor]
        cursor++
      }
    }

    if (value.length > 0) {
      let type: TokenType = 'WORD'
      if (value === 'AND') type = 'AND'
      else if (value === 'OR') type = 'OR'
      else if (value === 'NOT') type = 'NOT'

      tokens.push({ type, value, start, end: cursor })
    }
  }

  tokens.push({ type: 'EOF', value: '', start: cursor, end: cursor })
  return tokens
}

export type ASTNode =
  | { type: 'AND'; left: ASTNode; right: ASTNode }
  | { type: 'OR'; left: ASTNode; right: ASTNode }
  | { type: 'NOT'; node: ASTNode }
  | { type: 'FIELD'; field: string; comparator: TokenType; value: string; isString: boolean }
  | { type: 'TERM'; value: string; isString: boolean }

export class SearchQueryParser {
  private tokens: Token[] = []
  private cursor = 0

  parse(input: string): ASTNode | null {
    if (!input || input.trim() === '') return null
    this.tokens = tokenize(input)
    this.cursor = 0

    if (this.isAtEnd()) return null

    return this.parseQuery()
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF'
  }

  private peek(): Token {
    return this.tokens[this.cursor]
  }

  private previous(): Token {
    return this.tokens[this.cursor - 1]
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }
    return false
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false
    return this.peek().type === type
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.cursor++
    return this.previous()
  }

  // Query = Term { [ Connective ] Term }
  private parseQuery(): ASTNode {
    return this.parseAnd()
  }

  private parseAnd(): ASTNode {
    let expr = this.parseOr()

    while (this.check('AND') || this.canStartTerm()) {
      let explicitAnd = false
      if (this.match('AND')) {
        explicitAnd = true
      }

      if (!explicitAnd && !this.canStartTerm()) {
        break
      }

      const right = this.parseOr()
      expr = { type: 'AND', left: expr, right }
    }

    return expr
  }

  private parseOr(): ASTNode {
    let expr = this.parseTerm()

    while (this.match('OR')) {
      const right = this.parseTerm()
      expr = { type: 'OR', left: expr, right }
    }

    return expr
  }

  private canStartTerm(): boolean {
    const t = this.peek().type
    return t === 'WORD' || t === 'STRING' || t === 'LPAREN' || t === 'MINUS' || t === 'NOT'
  }

  // Term = [ Modifier ] ( "(" Query ")" | [ name Comparator ] value )
  private parseTerm(): ASTNode {
    let isNegated = false

    if (this.match('MINUS', 'NOT')) {
      isNegated = true
    }

    let node: ASTNode

    if (this.match('LPAREN')) {
      node = this.parseQuery()
      if (this.check('RPAREN')) {
        this.advance()
      }
    } else {
      node = this.parseValueOrField()
    }

    if (isNegated) {
      return { type: 'NOT', node }
    }

    return node
  }

  private parseValueOrField(): ASTNode {
    // A value or a name followed by a comparator and a value
    if (this.check('WORD')) {
      const nameToken = this.peek()
      // Peek ahead to see if it's a comparator
      const nextToken = this.tokens[this.cursor + 1]

      if (
        nextToken &&
        (nextToken.type === 'SEARCH' ||
          nextToken.type === 'EXACT' ||
          nextToken.type === 'LT' ||
          nextToken.type === 'GT' ||
          nextToken.type === 'LTE' ||
          nextToken.type === 'GTE')
      ) {
        this.advance() // consume name
        this.advance() // consume comparator

        const valToken = this.advance()
        // If the value is a string literal, we record it.
        const isString = valToken.type === 'STRING'

        // If the valToken is somehow EOF or not a value, we gracefully fallback
        if (valToken.type === 'EOF') {
          return { type: 'TERM', value: nameToken.value, isString: false }
        }

        return {
          type: 'FIELD',
          field: nameToken.value,
          comparator: nextToken.type,
          value: valToken.value,
          isString,
        }
      }
    }

    // Default search term
    const token = this.advance()
    if (token.type === 'EOF') {
      return { type: 'TERM', value: '', isString: false }
    }
    return { type: 'TERM', value: token.value, isString: token.type === 'STRING' }
  }
}
