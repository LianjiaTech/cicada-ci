export interface PaginationOptionsInterface {
  page_size: number;
  page: number;
}

export interface PaginationResultInterface<PaginationEntity> {
  results: PaginationEntity[];
  total: number;
}
