import { NextResponse } from "next/server";

interface ResponseOptions<T> {
  message: string;
  data?: T;
  status?: number;
}

export function apiResponse<T>({
  message,
  data,
  status = 200,
}: ResponseOptions<T>) {
  return NextResponse.json(
    {
      success: status < 400,
      message,
      data,
    },
    {
      status,
    }
  );
}