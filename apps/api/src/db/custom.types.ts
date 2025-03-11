import { Type } from '@mikro-orm/postgresql'

export class Point {
  constructor(
    public latitude: number,
    public longitude: number,
  ) {}
}

export class PointType extends Type<Point | undefined, string | undefined> {
  convertToDatabaseValue(value: Point | undefined): string | undefined {
    if (!value) {
      return value
    }

    return `point(${value.latitude} ${value.longitude})`
  }

  convertToJSValue(value: string | undefined): Point | undefined {
    const m = value?.match(/point\((-?\d+(\.\d+)?) (-?\d+(\.\d+)?)\)/i)

    if (!m) {
      return undefined
    }

    return new Point(+m[1], +m[3])
  }

  convertToJSValueSQL(key: string) {
    return `ST_AsText(${key})`
  }

  convertToDatabaseValueSQL(key: string) {
    return `ST_PointFromText(${key})`
  }

  getColumnType(): string {
    return 'geography(point)'
  }
}

export class MultiPolygon {
  constructor(public wkt: string) {}
}

export class MultiPolygonType extends Type<
  MultiPolygon | undefined,
  string | undefined
> {
  convertToDatabaseValue(value: MultiPolygon | undefined): string | undefined {
    if (!value) {
      return value
    }

    return value.wkt
  }

  convertToJSValue(value: string | undefined): MultiPolygon | undefined {
    if (!value) {
      return undefined
    }

    return new MultiPolygon(value)
  }

  convertToJSValueSQL(key: string) {
    return `ST_AsEWKT(${key})`
  }

  convertToDatabaseValueSQL(key: string) {
    return `ST_GeogFromEWKT(${key})`
  }

  getColumnType(): string {
    return 'geography(multipolygon)'
  }
}
