import { env } from '@/env';
import { api } from '@/trpc/server';
import { type NextRequest, NextResponse } from 'next/server';

// Handler para OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topNumber = searchParams.get('topNumber');
    const token = searchParams.get('token');
    const orderBy = searchParams.get('orderBy') ?? 'nome';
    const orderType = searchParams.get('orderType') ?? 'asc';
  
    if (!token || token !== env.SECRET_TOKEN_HAKUNAS_TAG) {
      console.log(`Recebi o token: ${token}`);
      return NextResponse.json(
        { error: 'Acesso não autorizado. Token inválido.' },
        { status: 401 }
      );
    }
  
    if (!topNumber) {
      return NextResponse.json(
        { error: 'Parâmetro topNumber é obrigatório' },
        { status: 400 }
      );
    }
  
    const number = parseInt(topNumber);
    if (isNaN(number)) {
      return NextResponse.json(
        { error: 'topNumber deve ser um número válido' },
        { status: 400 }
      );
    }
  
    const data = await api.integration.getConfirmedRegistration({
      topNumber: number,
      secret_token: token,
      orderBy: orderBy as 'nome' | 'saude' | 'familia' | 'createdAt',
      orderType: orderType as 'asc' | 'desc',
    });
  
    if (!data) {
      return NextResponse.json(
        { error: `Nenhuma inscrição encontrada para o evento com o topNumber: ${topNumber}` },
        { status: 404 }
      );
    }
  
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro na requisição:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}