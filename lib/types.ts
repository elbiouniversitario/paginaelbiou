export type Posicion =
  | "Arquero"
  | "Defensor"
  | "Mediocampista"
  | "Delantero";

export type EstadoPartido = "programado" | "en_curso" | "finalizado" | "suspendido";

export type CategoriaProducto = "Camisetas" | "Shorts" | "Accesorios" | "Calzado";

export interface Jugador {
  id: string;
  nombre: string;
  apellido: string;
  posicion: Posicion;
  numero: number;
  edad: number;
  foto_url?: string;
}

export interface Partido {
  id: string;
  rival: string;
  fecha: string;
  hora: string;
  sede: string;
  es_local: boolean;
  estado: EstadoPartido;
  resultado_local?: number;
  resultado_visitante?: number;
  competencia: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  foto_url: string;
  categoria: CategoriaProducto;
  stock: number;
  destacado?: boolean;
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
  talle?: string;
}

export type Database = {
  public: {
    Tables: {
      jugadores: {
        Row: Jugador;
        Insert: Omit<Jugador, "id">;
        Update: Partial<Jugador>;
      };
      partidos: {
        Row: Partido;
        Insert: Omit<Partido, "id">;
        Update: Partial<Partido>;
      };
      productos: {
        Row: Producto;
        Insert: Omit<Producto, "id">;
        Update: Partial<Producto>;
      };
    };
  };
};
