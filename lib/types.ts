export type Posicion = "Arquero" | "Defensor" | "Mediocampista" | "Delantero";
export type EstadoPartido = "programado" | "en_curso" | "finalizado" | "suspendido";
export type CategoriaProducto = "Camisetas" | "Shorts" | "Abrigos" | "Accesorios" | "Calzado";
export type CategoriaEquipo = "Mayor" | "Reserva" | "Pre-Senior" | "Sub 20" | "Sub 18" | "Femenino";

export interface Profile {
  id: string;
  nombre: string | null;
  posicion: Posicion | null;
  numero: number | null;
  categoria: CategoriaEquipo | null;
  foto_url: string | null;
  habilitado: boolean;
  es_admin: boolean;
  created_at: string;
}

export interface Jugador {
  id: string;
  nombre: string;
  apellido: string;
  posicion: Posicion;
  numero: number;
  edad: number | null;
  foto_url?: string;
}

export interface Partido {
  id: string;
  rival: string;
  fecha: string;
  hora: string | null;
  sede: string | null;
  es_local: boolean;
  estado: EstadoPartido;
  resultado_local?: number | null;
  resultado_visitante?: number | null;
  competencia: string | null;
  categoria: CategoriaEquipo;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  foto_url: string;
  categoria: CategoriaProducto;
  talles: string[];
  stock: number;
  destacado?: boolean;
  activo?: boolean;
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
  talle?: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
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
