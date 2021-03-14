export class HttpResponse<T> {
  constructor(private readonly success: boolean, private readonly data: T) {}
}
