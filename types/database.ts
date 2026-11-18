export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      aceptacion_terminos: {
        Row: {
          aceptado_en: string
          id_aceptacion: number
          id_refugio: number | null
          id_usuario: number
          terminos_version: string
        }
        Insert: {
          aceptado_en?: string
          id_aceptacion?: never
          id_refugio?: number | null
          id_usuario: number
          terminos_version: string
        }
        Update: {
          aceptado_en?: string
          id_aceptacion?: never
          id_refugio?: number | null
          id_usuario?: number
          terminos_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "aceptacion_terminos_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "aceptacion_terminos_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      adoptante: {
        Row: {
          acepta_politica_privacidad: boolean
          correo: string
          declara_mayor_edad: boolean
          direccion: string
          espacio_techado: boolean
          experiencia_mascotas: string | null
          fecha_aceptacion_privacidad: string | null
          fecha_registro: string
          id_adoptante: number
          id_refugio: number
          nombre_completo: string
          telefono: string
          tiempo_solo_horas: number | null
          tiene_ninos: boolean
          tiene_otras_mascotas: boolean
        }
        Insert: {
          acepta_politica_privacidad?: boolean
          correo: string
          declara_mayor_edad?: boolean
          direccion: string
          espacio_techado?: boolean
          experiencia_mascotas?: string | null
          fecha_aceptacion_privacidad?: string | null
          fecha_registro?: string
          id_adoptante?: number
          id_refugio: number
          nombre_completo: string
          telefono: string
          tiempo_solo_horas?: number | null
          tiene_ninos?: boolean
          tiene_otras_mascotas?: boolean
        }
        Update: {
          acepta_politica_privacidad?: boolean
          correo?: string
          declara_mayor_edad?: boolean
          direccion?: string
          espacio_techado?: boolean
          experiencia_mascotas?: string | null
          fecha_aceptacion_privacidad?: string | null
          fecha_registro?: string
          id_adoptante?: number
          id_refugio?: number
          nombre_completo?: string
          telefono?: string
          tiempo_solo_horas?: number | null
          tiene_ninos?: boolean
          tiene_otras_mascotas?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_adoptante_refugio"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
        ]
      }
      albergue_bloque: {
        Row: {
          contenido: Json
          fecha_creacion: string
          id_bloque: number
          id_perfil: number
          orden: number
          tipo: Database["public"]["Enums"]["bloque_tipo"]
          visible: boolean
        }
        Insert: {
          contenido?: Json
          fecha_creacion?: string
          id_bloque?: number
          id_perfil: number
          orden?: number
          tipo: Database["public"]["Enums"]["bloque_tipo"]
          visible?: boolean
        }
        Update: {
          contenido?: Json
          fecha_creacion?: string
          id_bloque?: number
          id_perfil?: number
          orden?: number
          tipo?: Database["public"]["Enums"]["bloque_tipo"]
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_bloque_perfil"
            columns: ["id_perfil"]
            isOneToOne: false
            referencedRelation: "albergue_perfil"
            referencedColumns: ["id_perfil"]
          },
        ]
      }
      albergue_perfil: {
        Row: {
          color_primario: string | null
          color_secundario: string | null
          descripcion_corta: string | null
          fecha_actualizacion: string
          id_perfil: number
          id_refugio: number
          logo_url: string | null
          portada_url: string | null
          slug: string
          visible_publico: boolean
        }
        Insert: {
          color_primario?: string | null
          color_secundario?: string | null
          descripcion_corta?: string | null
          fecha_actualizacion?: string
          id_perfil?: number
          id_refugio: number
          logo_url?: string | null
          portada_url?: string | null
          slug: string
          visible_publico?: boolean
        }
        Update: {
          color_primario?: string | null
          color_secundario?: string | null
          descripcion_corta?: string | null
          fecha_actualizacion?: string
          id_perfil?: number
          id_refugio?: number
          logo_url?: string | null
          portada_url?: string | null
          slug?: string
          visible_publico?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_perfil_refugio"
            columns: ["id_refugio"]
            isOneToOne: true
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
        ]
      }
      altas_cuarentena: {
        Row: {
          created_at: string
          fecha_alta: string
          id_alta: number
          id_animal: number
          id_refugio: number
          id_usuario_veterinario: number
          observaciones: string
        }
        Insert: {
          created_at?: string
          fecha_alta?: string
          id_alta?: number
          id_animal: number
          id_refugio: number
          id_usuario_veterinario: number
          observaciones: string
        }
        Update: {
          created_at?: string
          fecha_alta?: string
          id_alta?: number
          id_animal?: number
          id_refugio?: number
          id_usuario_veterinario?: number
          observaciones?: string
        }
        Relationships: [
          {
            foreignKeyName: "altas_cuarentena_id_animal_fkey"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "altas_cuarentena_id_animal_fkey"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal_adopcion_publica"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "altas_cuarentena_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "altas_cuarentena_id_usuario_veterinario_fkey"
            columns: ["id_usuario_veterinario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      animal: {
        Row: {
          activo: boolean
          color: string | null
          deleted_at: string | null
          desparasitado: boolean
          disponible_adopcion: boolean
          edad_estimada: number | null
          en_cuarentena: boolean
          especie: string
          estado_inicial: string
          esterilizado: boolean
          fecha_adopcion: string | null
          fecha_ingreso: string
          fecha_rescate: string | null
          fecha_reserva: string | null
          id_animal: number
          id_espacio: number
          id_estado: number
          id_refugio: number
          lugar_rescate: string | null
          microchip: string | null
          nombre: string | null
          observaciones: string | null
          peso: number | null
          procedencia: string
          rasgos_fisicos: string
          raza: string | null
          rescatista_contacto: string | null
          rescatista_nombre: string | null
          reservado_adopcion: boolean
          sexo: string | null
          situacion_rescate: string | null
          tamano: string | null
          temperamento: string | null
          uuid: string | null
          vacunado: boolean
        }
        Insert: {
          activo?: boolean
          color?: string | null
          deleted_at?: string | null
          desparasitado?: boolean
          disponible_adopcion?: boolean
          edad_estimada?: number | null
          en_cuarentena?: boolean
          especie: string
          estado_inicial: string
          esterilizado?: boolean
          fecha_adopcion?: string | null
          fecha_ingreso?: string
          fecha_rescate?: string | null
          fecha_reserva?: string | null
          id_animal?: number
          id_espacio: number
          id_estado: number
          id_refugio: number
          lugar_rescate?: string | null
          microchip?: string | null
          nombre?: string | null
          observaciones?: string | null
          peso?: number | null
          procedencia: string
          rasgos_fisicos: string
          raza?: string | null
          rescatista_contacto?: string | null
          rescatista_nombre?: string | null
          reservado_adopcion?: boolean
          sexo?: string | null
          situacion_rescate?: string | null
          tamano?: string | null
          temperamento?: string | null
          uuid?: string | null
          vacunado?: boolean
        }
        Update: {
          activo?: boolean
          color?: string | null
          deleted_at?: string | null
          desparasitado?: boolean
          disponible_adopcion?: boolean
          edad_estimada?: number | null
          en_cuarentena?: boolean
          especie?: string
          estado_inicial?: string
          esterilizado?: boolean
          fecha_adopcion?: string | null
          fecha_ingreso?: string
          fecha_rescate?: string | null
          fecha_reserva?: string | null
          id_animal?: number
          id_espacio?: number
          id_estado?: number
          id_refugio?: number
          lugar_rescate?: string | null
          microchip?: string | null
          nombre?: string | null
          observaciones?: string | null
          peso?: number | null
          procedencia?: string
          rasgos_fisicos?: string
          raza?: string | null
          rescatista_contacto?: string | null
          rescatista_nombre?: string | null
          reservado_adopcion?: boolean
          sexo?: string | null
          situacion_rescate?: string | null
          tamano?: string | null
          temperamento?: string | null
          uuid?: string | null
          vacunado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_animal_espacio"
            columns: ["id_espacio"]
            isOneToOne: false
            referencedRelation: "espacio"
            referencedColumns: ["id_espacio"]
          },
          {
            foreignKeyName: "fk_animal_estado"
            columns: ["id_estado"]
            isOneToOne: false
            referencedRelation: "animal_estado"
            referencedColumns: ["id_estado"]
          },
          {
            foreignKeyName: "fk_animal_refugio"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
        ]
      }
      animal_estado: {
        Row: {
          descripcion: string | null
          id_estado: number
          nombre_estado: string
        }
        Insert: {
          descripcion?: string | null
          id_estado?: number
          nombre_estado: string
        }
        Update: {
          descripcion?: string | null
          id_estado?: number
          nombre_estado?: string
        }
        Relationships: []
      }
      auditoria: {
        Row: {
          accion: string
          descripcion: string | null
          entidad_id: number | null
          fecha_evento: string
          id_auditoria: number
          id_refugio: number
          id_usuario: number
          ip_origen: string | null
          modulo: string
        }
        Insert: {
          accion: string
          descripcion?: string | null
          entidad_id?: number | null
          fecha_evento?: string
          id_auditoria?: number
          id_refugio: number
          id_usuario: number
          ip_origen?: string | null
          modulo: string
        }
        Update: {
          accion?: string
          descripcion?: string | null
          entidad_id?: number | null
          fecha_evento?: string
          id_auditoria?: number
          id_refugio?: number
          id_usuario?: number
          ip_origen?: string | null
          modulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_auditoria_refugio"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "fk_auditoria_usuario"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      campana: {
        Row: {
          contenido: string
          estado: string
          fecha_actualizacion: string
          fecha_creacion: string
          fecha_publicacion: string | null
          generada_por_ia: boolean
          hashtags: string[]
          id_campana: number
          id_refugio: number
          id_usuario_creador: number | null
          llamado_accion: string | null
          modelo_ia: string | null
          titulo: string
        }
        Insert: {
          contenido: string
          estado?: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          fecha_publicacion?: string | null
          generada_por_ia?: boolean
          hashtags?: string[]
          id_campana?: never
          id_refugio: number
          id_usuario_creador?: number | null
          llamado_accion?: string | null
          modelo_ia?: string | null
          titulo: string
        }
        Update: {
          contenido?: string
          estado?: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          fecha_publicacion?: string | null
          generada_por_ia?: boolean
          hashtags?: string[]
          id_campana?: never
          id_refugio?: number
          id_usuario_creador?: number | null
          llamado_accion?: string | null
          modelo_ia?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "campana_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "campana_id_usuario_creador_fkey"
            columns: ["id_usuario_creador"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      campana_animal: {
        Row: {
          id_animal: number
          id_campana: number
        }
        Insert: {
          id_animal: number
          id_campana: number
        }
        Update: {
          id_animal?: number
          id_campana?: number
        }
        Relationships: [
          {
            foreignKeyName: "campana_animal_id_animal_fkey"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "campana_animal_id_animal_fkey"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal_adopcion_publica"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "campana_animal_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campana"
            referencedColumns: ["id_campana"]
          },
          {
            foreignKeyName: "campana_animal_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campana_publica"
            referencedColumns: ["id_campana"]
          },
        ]
      }
      chequeo_sintomas: {
        Row: {
          id_chequeo: number
          sintoma: string
        }
        Insert: {
          id_chequeo: number
          sintoma: string
        }
        Update: {
          id_chequeo?: number
          sintoma?: string
        }
        Relationships: [
          {
            foreignKeyName: "chequeo_sintomas_id_chequeo_fkey"
            columns: ["id_chequeo"]
            isOneToOne: false
            referencedRelation: "chequeos_medicos"
            referencedColumns: ["id_chequeo"]
          },
        ]
      }
      chequeos_medicos: {
        Row: {
          created_at: string
          fecha_chequeo: string
          frecuencia_cardiaca: number
          frecuencia_respiratoria: number
          id_animal: number
          id_chequeo: number
          id_refugio: number
          id_usuario: number
          observaciones: string | null
          peso_kg: number
          sintoma_otro_detalle: string | null
          temperatura_c: number
        }
        Insert: {
          created_at?: string
          fecha_chequeo?: string
          frecuencia_cardiaca: number
          frecuencia_respiratoria: number
          id_animal: number
          id_chequeo?: number
          id_refugio: number
          id_usuario: number
          observaciones?: string | null
          peso_kg: number
          sintoma_otro_detalle?: string | null
          temperatura_c: number
        }
        Update: {
          created_at?: string
          fecha_chequeo?: string
          frecuencia_cardiaca?: number
          frecuencia_respiratoria?: number
          id_animal?: number
          id_chequeo?: number
          id_refugio?: number
          id_usuario?: number
          observaciones?: string | null
          peso_kg?: number
          sintoma_otro_detalle?: string | null
          temperatura_c?: number
        }
        Relationships: [
          {
            foreignKeyName: "chequeos_medicos_id_animal_fkey"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "chequeos_medicos_id_animal_fkey"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal_adopcion_publica"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "chequeos_medicos_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "chequeos_medicos_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      cirugia_insumo: {
        Row: {
          cantidad: number
          created_at: string
          id_cirugia: number
          id_cirugia_insumo: number
          id_lote_inventario: number
          id_refugio: number
        }
        Insert: {
          cantidad: number
          created_at?: string
          id_cirugia: number
          id_cirugia_insumo?: number
          id_lote_inventario: number
          id_refugio: number
        }
        Update: {
          cantidad?: number
          created_at?: string
          id_cirugia?: number
          id_cirugia_insumo?: number
          id_lote_inventario?: number
          id_refugio?: number
        }
        Relationships: [
          {
            foreignKeyName: "cirugia_insumo_id_cirugia_fkey"
            columns: ["id_cirugia"]
            isOneToOne: false
            referencedRelation: "cirugia_reproductiva"
            referencedColumns: ["id_cirugia"]
          },
          {
            foreignKeyName: "cirugia_insumo_id_lote_inventario_fkey"
            columns: ["id_lote_inventario"]
            isOneToOne: false
            referencedRelation: "inventario_lote"
            referencedColumns: ["id_lote_inventario"]
          },
          {
            foreignKeyName: "cirugia_insumo_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
        ]
      }
      cirugia_reproductiva: {
        Row: {
          exitosa: boolean
          fecha_cirugia: string
          id_animal: number
          id_cirugia: number
          id_refugio: number
          id_usuario: number
          notas_postoperatorias: string | null
          tipo_cirugia: string
        }
        Insert: {
          exitosa?: boolean
          fecha_cirugia: string
          id_animal: number
          id_cirugia?: number
          id_refugio: number
          id_usuario: number
          notas_postoperatorias?: string | null
          tipo_cirugia: string
        }
        Update: {
          exitosa?: boolean
          fecha_cirugia?: string
          id_animal?: number
          id_cirugia?: number
          id_refugio?: number
          id_usuario?: number
          notas_postoperatorias?: string | null
          tipo_cirugia?: string
        }
        Relationships: [
          {
            foreignKeyName: "cirugia_reproductiva_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "fk_cirugia_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "fk_cirugia_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal_adopcion_publica"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "fk_cirugia_usuario"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      diagnostico_veterinario: {
        Row: {
          descripcion: string
          estado_general: string
          fecha_diagnostico: string
          id_animal: number
          id_diagnostico: number
          id_usuario: number
          requiere_cirugia: boolean
          requiere_cuarentena: boolean
          tratamiento_inicial: string | null
        }
        Insert: {
          descripcion: string
          estado_general: string
          fecha_diagnostico?: string
          id_animal: number
          id_diagnostico?: number
          id_usuario: number
          requiere_cirugia?: boolean
          requiere_cuarentena?: boolean
          tratamiento_inicial?: string | null
        }
        Update: {
          descripcion?: string
          estado_general?: string
          fecha_diagnostico?: string
          id_animal?: number
          id_diagnostico?: number
          id_usuario?: number
          requiere_cirugia?: boolean
          requiere_cuarentena?: boolean
          tratamiento_inicial?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_dx_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "fk_dx_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal_adopcion_publica"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "fk_dx_usuario"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      donacion: {
        Row: {
          caducidad: string | null
          cantidad: number
          descripcion: string
          fecha_donacion: string
          id_donacion: number
          id_donante: number
          id_refugio: number
          tipo_donacion: string
          unidad_medida: string
        }
        Insert: {
          caducidad?: string | null
          cantidad: number
          descripcion: string
          fecha_donacion?: string
          id_donacion?: number
          id_donante: number
          id_refugio: number
          tipo_donacion: string
          unidad_medida: string
        }
        Update: {
          caducidad?: string | null
          cantidad?: number
          descripcion?: string
          fecha_donacion?: string
          id_donacion?: number
          id_donante?: number
          id_refugio?: number
          tipo_donacion?: string
          unidad_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_donacion_donante"
            columns: ["id_donante"]
            isOneToOne: false
            referencedRelation: "donante"
            referencedColumns: ["id_donante"]
          },
          {
            foreignKeyName: "fk_donacion_refugio"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
        ]
      }
      donante: {
        Row: {
          correo: string | null
          fecha_registro: string
          id_donante: number
          nombre_completo: string
          notas: string | null
          telefono: string | null
          tipo_donante: string
        }
        Insert: {
          correo?: string | null
          fecha_registro?: string
          id_donante?: number
          nombre_completo: string
          notas?: string | null
          telefono?: string | null
          tipo_donante: string
        }
        Update: {
          correo?: string | null
          fecha_registro?: string
          id_donante?: number
          nombre_completo?: string
          notas?: string | null
          telefono?: string | null
          tipo_donante?: string
        }
        Relationships: []
      }
      espacio: {
        Row: {
          capacidad: number
          descripcion: string | null
          disponible: boolean
          id_espacio: number
          id_refugio: number
          nombre_espacio: string
          tipo: string | null
        }
        Insert: {
          capacidad: number
          descripcion?: string | null
          disponible?: boolean
          id_espacio?: number
          id_refugio: number
          nombre_espacio: string
          tipo?: string | null
        }
        Update: {
          capacidad?: number
          descripcion?: string | null
          disponible?: boolean
          id_espacio?: number
          id_refugio?: number
          nombre_espacio?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_espacio_refugio"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
        ]
      }
      evaluacion_adopcion: {
        Row: {
          comentarios: string | null
          fecha_evaluacion: string
          id_evaluacion_adopcion: number
          id_refugio: number
          id_solicitud: number
          id_usuario: number
          puntuacion: number | null
          resultado: string
          tipo_evaluacion: string
        }
        Insert: {
          comentarios?: string | null
          fecha_evaluacion?: string
          id_evaluacion_adopcion?: number
          id_refugio: number
          id_solicitud: number
          id_usuario: number
          puntuacion?: number | null
          resultado?: string
          tipo_evaluacion: string
        }
        Update: {
          comentarios?: string | null
          fecha_evaluacion?: string
          id_evaluacion_adopcion?: number
          id_refugio?: number
          id_solicitud?: number
          id_usuario?: number
          puntuacion?: number | null
          resultado?: string
          tipo_evaluacion?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluacion_adopcion_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "fk_eval_solicitud"
            columns: ["id_solicitud"]
            isOneToOne: false
            referencedRelation: "solicitud_adopcion"
            referencedColumns: ["id_solicitud"]
          },
          {
            foreignKeyName: "fk_eval_usuario"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      evaluacion_temperamento: {
        Row: {
          apto_gatos: string | null
          apto_ninos: string | null
          apto_perros: string | null
          comportamiento: string | null
          fecha_evaluacion: string
          id_animal: number
          id_evaluacion_temperamento: number
          id_refugio: number | null
          id_usuario: number
          nivel_energia: string | null
        }
        Insert: {
          apto_gatos?: string | null
          apto_ninos?: string | null
          apto_perros?: string | null
          comportamiento?: string | null
          fecha_evaluacion?: string
          id_animal: number
          id_evaluacion_temperamento?: number
          id_refugio?: number | null
          id_usuario: number
          nivel_energia?: string | null
        }
        Update: {
          apto_gatos?: string | null
          apto_ninos?: string | null
          apto_perros?: string | null
          comportamiento?: string | null
          fecha_evaluacion?: string
          id_animal?: number
          id_evaluacion_temperamento?: number
          id_refugio?: number | null
          id_usuario?: number
          nivel_energia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluacion_temperamento_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "fk_temp_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "fk_temp_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal_adopcion_publica"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "fk_temp_usuario"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      evento_sanitario: {
        Row: {
          cantidad: number
          esquema_completo: boolean
          fecha_aplicacion: string
          fecha_refuerzo: string | null
          fecha_registro: string
          id_animal: number
          id_evento: number
          id_lote_inventario: number | null
          id_refugio: number | null
          id_usuario: number
          marca_lote: string | null
          observaciones: string | null
          tipo_biologico: string
          tipo_evento: string
        }
        Insert: {
          cantidad?: number
          esquema_completo?: boolean
          fecha_aplicacion?: string
          fecha_refuerzo?: string | null
          fecha_registro?: string
          id_animal: number
          id_evento?: number
          id_lote_inventario?: number | null
          id_refugio?: number | null
          id_usuario: number
          marca_lote?: string | null
          observaciones?: string | null
          tipo_biologico: string
          tipo_evento?: string
        }
        Update: {
          cantidad?: number
          esquema_completo?: boolean
          fecha_aplicacion?: string
          fecha_refuerzo?: string | null
          fecha_registro?: string
          id_animal?: number
          id_evento?: number
          id_lote_inventario?: number | null
          id_refugio?: number | null
          id_usuario?: number
          marca_lote?: string | null
          observaciones?: string | null
          tipo_biologico?: string
          tipo_evento?: string
        }
        Relationships: [
          {
            foreignKeyName: "evento_sanitario_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "evento_sanitario_lote_fkey"
            columns: ["id_lote_inventario"]
            isOneToOne: false
            referencedRelation: "inventario_lote"
            referencedColumns: ["id_lote_inventario"]
          },
          {
            foreignKeyName: "fk_vacuna_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "fk_vacuna_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal_adopcion_publica"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "fk_vacuna_usuario"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      excepcion_aptitud_adopcion: {
        Row: {
          criterios_omitidos: string[]
          fecha_excepcion: string
          fecha_revocacion: string | null
          id_animal: number
          id_excepcion: number
          id_refugio: number
          id_usuario: number
          motivo: string
          revocada: boolean
        }
        Insert: {
          criterios_omitidos?: string[]
          fecha_excepcion?: string
          fecha_revocacion?: string | null
          id_animal: number
          id_excepcion?: number
          id_refugio: number
          id_usuario: number
          motivo: string
          revocada?: boolean
        }
        Update: {
          criterios_omitidos?: string[]
          fecha_excepcion?: string
          fecha_revocacion?: string | null
          id_animal?: number
          id_excepcion?: number
          id_refugio?: number
          id_usuario?: number
          motivo?: string
          revocada?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "excepcion_aptitud_adopcion_id_animal_fkey"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "excepcion_aptitud_adopcion_id_animal_fkey"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal_adopcion_publica"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "excepcion_aptitud_adopcion_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "excepcion_aptitud_adopcion_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      fotografia: {
        Row: {
          es_principal: boolean
          fecha_subida: string
          formato: string | null
          id_animal: number
          id_fotografia: number
          nombre_archivo: string
          orden: number
          public_id: string | null
          tamano_mb: number | null
          url_archivo: string
          url_thumbnail: string | null
        }
        Insert: {
          es_principal?: boolean
          fecha_subida?: string
          formato?: string | null
          id_animal: number
          id_fotografia?: number
          nombre_archivo: string
          orden?: number
          public_id?: string | null
          tamano_mb?: number | null
          url_archivo: string
          url_thumbnail?: string | null
        }
        Update: {
          es_principal?: boolean
          fecha_subida?: string
          formato?: string | null
          id_animal?: number
          id_fotografia?: number
          nombre_archivo?: string
          orden?: number
          public_id?: string | null
          tamano_mb?: number | null
          url_archivo?: string
          url_thumbnail?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_foto_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "fk_foto_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal_adopcion_publica"
            referencedColumns: ["id_animal"]
          },
        ]
      }
      historial_pago: {
        Row: {
          estado_pago: string
          fecha_pago: string
          id_pago: number
          id_plan: number
          id_suscripcion: number
          monto: number
        }
        Insert: {
          estado_pago: string
          fecha_pago?: string
          id_pago?: number
          id_plan: number
          id_suscripcion: number
          monto: number
        }
        Update: {
          estado_pago?: string
          fecha_pago?: string
          id_pago?: number
          id_plan?: number
          id_suscripcion?: number
          monto?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_pago_plan"
            columns: ["id_plan"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id_plan"]
          },
          {
            foreignKeyName: "fk_pago_suscripcion"
            columns: ["id_suscripcion"]
            isOneToOne: false
            referencedRelation: "suscripcion"
            referencedColumns: ["id_suscripcion"]
          },
        ]
      }
      inventario_insumo: {
        Row: {
          activo: boolean
          created_at: string
          id_insumo: number
          id_refugio: number
          nombre: string
          tipo_insumo: string
          unidad_medida: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id_insumo?: number
          id_refugio: number
          nombre: string
          tipo_insumo: string
          unidad_medida?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id_insumo?: number
          id_refugio?: number
          nombre?: string
          tipo_insumo?: string
          unidad_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventario_insumo_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
        ]
      }
      inventario_lote: {
        Row: {
          activo: boolean
          created_at: string
          fecha_caducidad: string | null
          id_insumo: number
          id_lote_inventario: number
          id_refugio: number
          lote: string | null
          marca: string | null
          stock_actual: number
          stock_minimo: number
        }
        Insert: {
          activo?: boolean
          created_at?: string
          fecha_caducidad?: string | null
          id_insumo: number
          id_lote_inventario?: number
          id_refugio: number
          lote?: string | null
          marca?: string | null
          stock_actual?: number
          stock_minimo?: number
        }
        Update: {
          activo?: boolean
          created_at?: string
          fecha_caducidad?: string | null
          id_insumo?: number
          id_lote_inventario?: number
          id_refugio?: number
          lote?: string | null
          marca?: string | null
          stock_actual?: number
          stock_minimo?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventario_lote_id_insumo_fkey"
            columns: ["id_insumo"]
            isOneToOne: false
            referencedRelation: "inventario_insumo"
            referencedColumns: ["id_insumo"]
          },
          {
            foreignKeyName: "inventario_lote_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
        ]
      }
      inventario_movimiento: {
        Row: {
          cantidad: number
          fecha: string
          id_lote_inventario: number
          id_movimiento: number
          id_referencia: string | null
          id_refugio: number
          id_usuario: number | null
          motivo: string
          tipo_movimiento: string
        }
        Insert: {
          cantidad: number
          fecha?: string
          id_lote_inventario: number
          id_movimiento?: number
          id_referencia?: string | null
          id_refugio: number
          id_usuario?: number | null
          motivo: string
          tipo_movimiento: string
        }
        Update: {
          cantidad?: number
          fecha?: string
          id_lote_inventario?: number
          id_movimiento?: number
          id_referencia?: string | null
          id_refugio?: number
          id_usuario?: number | null
          motivo?: string
          tipo_movimiento?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventario_movimiento_id_lote_inventario_fkey"
            columns: ["id_lote_inventario"]
            isOneToOne: false
            referencedRelation: "inventario_lote"
            referencedColumns: ["id_lote_inventario"]
          },
          {
            foreignKeyName: "inventario_movimiento_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "inventario_movimiento_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      invitacion_admin: {
        Row: {
          correo: string
          fecha_envio: string
          fecha_expira: string
          id_invitacion: number
          id_refugio: number
          token: string
          usado: boolean
        }
        Insert: {
          correo: string
          fecha_envio?: string
          fecha_expira?: string
          id_invitacion?: number
          id_refugio: number
          token: string
          usado?: boolean
        }
        Update: {
          correo?: string
          fecha_envio?: string
          fecha_expira?: string
          id_invitacion?: number
          id_refugio?: number
          token?: string
          usado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_invitacion_refugio"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
        ]
      }
      perfil_adopcion: {
        Row: {
          created_at: string
          descripcion_publica: string | null
          fecha_despublicacion: string | null
          fecha_publicacion: string | null
          id_animal: number
          id_perfil_adopcion: number
          id_refugio: number
          id_usuario_actualizacion: number | null
          id_usuario_creacion: number | null
          publicado: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion_publica?: string | null
          fecha_despublicacion?: string | null
          fecha_publicacion?: string | null
          id_animal: number
          id_perfil_adopcion?: number
          id_refugio: number
          id_usuario_actualizacion?: number | null
          id_usuario_creacion?: number | null
          publicado?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion_publica?: string | null
          fecha_despublicacion?: string | null
          fecha_publicacion?: string | null
          id_animal?: number
          id_perfil_adopcion?: number
          id_refugio?: number
          id_usuario_actualizacion?: number | null
          id_usuario_creacion?: number | null
          publicado?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfil_adopcion_id_animal_fkey"
            columns: ["id_animal"]
            isOneToOne: true
            referencedRelation: "animal"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "perfil_adopcion_id_animal_fkey"
            columns: ["id_animal"]
            isOneToOne: true
            referencedRelation: "animal_adopcion_publica"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "perfil_adopcion_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "perfil_adopcion_id_usuario_actualizacion_fkey"
            columns: ["id_usuario_actualizacion"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
          {
            foreignKeyName: "perfil_adopcion_id_usuario_creacion_fkey"
            columns: ["id_usuario_creacion"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      permiso: {
        Row: {
          descripcion: string | null
          id_permiso: number
          nombre_permiso: string
        }
        Insert: {
          descripcion?: string | null
          id_permiso?: number
          nombre_permiso: string
        }
        Update: {
          descripcion?: string | null
          id_permiso?: number
          nombre_permiso?: string
        }
        Relationships: []
      }
      planes: {
        Row: {
          duracion_dias: number
          id_plan: number
          plan: string
          precio_mensual: number
        }
        Insert: {
          duracion_dias: number
          id_plan?: number
          plan: string
          precio_mensual: number
        }
        Update: {
          duracion_dias?: number
          id_plan?: number
          plan?: string
          precio_mensual?: number
        }
        Relationships: []
      }
      refugio: {
        Row: {
          activo: boolean
          calle: string | null
          ciudad: string
          codigo_postal: string | null
          colonia: string | null
          correo_contacto: string
          descripcion_publica: string | null
          direccion: string | null
          estado: string
          fecha_registro: string
          id_refugio: number
          latitud: number | null
          longitud: number | null
          nombre: string
          numero: string | null
          slug: string
          telefono: string | null
        }
        Insert: {
          activo?: boolean
          calle?: string | null
          ciudad: string
          codigo_postal?: string | null
          colonia?: string | null
          correo_contacto: string
          descripcion_publica?: string | null
          direccion?: string | null
          estado: string
          fecha_registro?: string
          id_refugio?: number
          latitud?: number | null
          longitud?: number | null
          nombre: string
          numero?: string | null
          slug: string
          telefono?: string | null
        }
        Update: {
          activo?: boolean
          calle?: string | null
          ciudad?: string
          codigo_postal?: string | null
          colonia?: string | null
          correo_contacto?: string
          descripcion_publica?: string | null
          direccion?: string | null
          estado?: string
          fecha_registro?: string
          id_refugio?: number
          latitud?: number | null
          longitud?: number | null
          nombre?: string
          numero?: string | null
          slug?: string
          telefono?: string | null
        }
        Relationships: []
      }
      rehabilitacion: {
        Row: {
          fecha_fin: string | null
          fecha_inicio: string
          fecha_registro: string
          id_animal: number
          id_refugio: number
          id_rehabilitacion: number
          id_usuario: number
          objetivo: string
          observaciones: string | null
          tipo: string
        }
        Insert: {
          fecha_fin?: string | null
          fecha_inicio: string
          fecha_registro?: string
          id_animal: number
          id_refugio: number
          id_rehabilitacion?: number
          id_usuario: number
          objetivo: string
          observaciones?: string | null
          tipo: string
        }
        Update: {
          fecha_fin?: string | null
          fecha_inicio?: string
          fecha_registro?: string
          id_animal?: number
          id_refugio?: number
          id_rehabilitacion?: number
          id_usuario?: number
          objetivo?: string
          observaciones?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "rehabilitacion_id_animal_fkey"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "rehabilitacion_id_animal_fkey"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal_adopcion_publica"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "rehabilitacion_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "rehabilitacion_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      rol: {
        Row: {
          descripcion: string | null
          id_rol: number
          nombre_rol: string
        }
        Insert: {
          descripcion?: string | null
          id_rol?: number
          nombre_rol: string
        }
        Update: {
          descripcion?: string | null
          id_rol?: number
          nombre_rol?: string
        }
        Relationships: []
      }
      rol_permiso: {
        Row: {
          id_permiso: number
          id_rol: number
          id_rol_permiso: number
        }
        Insert: {
          id_permiso: number
          id_rol: number
          id_rol_permiso?: number
        }
        Update: {
          id_permiso?: number
          id_rol?: number
          id_rol_permiso?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_rolpermiso_permiso"
            columns: ["id_permiso"]
            isOneToOne: false
            referencedRelation: "permiso"
            referencedColumns: ["id_permiso"]
          },
          {
            foreignKeyName: "fk_rolpermiso_rol"
            columns: ["id_rol"]
            isOneToOne: false
            referencedRelation: "rol"
            referencedColumns: ["id_rol"]
          },
        ]
      }
      solicitud_adopcion: {
        Row: {
          codigo_seguimiento: string
          comentarios_generales: string | null
          estado_solicitud: string
          fecha_cierre: string | null
          fecha_solicitud: string
          id_adoptante: number
          id_animal: number
          id_refugio: number
          id_solicitud: number
          id_usuario_cierre: number | null
          motivo_adopcion: string | null
          motivo_rechazo: string | null
        }
        Insert: {
          codigo_seguimiento?: string
          comentarios_generales?: string | null
          estado_solicitud?: string
          fecha_cierre?: string | null
          fecha_solicitud?: string
          id_adoptante: number
          id_animal: number
          id_refugio: number
          id_solicitud?: number
          id_usuario_cierre?: number | null
          motivo_adopcion?: string | null
          motivo_rechazo?: string | null
        }
        Update: {
          codigo_seguimiento?: string
          comentarios_generales?: string | null
          estado_solicitud?: string
          fecha_cierre?: string | null
          fecha_solicitud?: string
          id_adoptante?: number
          id_animal?: number
          id_refugio?: number
          id_solicitud?: number
          id_usuario_cierre?: number | null
          motivo_adopcion?: string | null
          motivo_rechazo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_solicitud_adoptante"
            columns: ["id_adoptante"]
            isOneToOne: false
            referencedRelation: "adoptante"
            referencedColumns: ["id_adoptante"]
          },
          {
            foreignKeyName: "fk_solicitud_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "fk_solicitud_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal_adopcion_publica"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "solicitud_adopcion_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "solicitud_adopcion_id_usuario_cierre_fkey"
            columns: ["id_usuario_cierre"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      super_admin: {
        Row: {
          activo: boolean
          auth_user_id: string
          correo: string
          fecha_creacion: string
          id_superadmin: number
        }
        Insert: {
          activo?: boolean
          auth_user_id: string
          correo: string
          fecha_creacion?: string
          id_superadmin?: number
        }
        Update: {
          activo?: boolean
          auth_user_id?: string
          correo?: string
          fecha_creacion?: string
          id_superadmin?: number
        }
        Relationships: []
      }
      suscripcion: {
        Row: {
          estado: string
          fecha_inicio: string
          fecha_vencimiento: string | null
          id_plan: number
          id_refugio: number
          id_suscripcion: number
          renovacion_automatica: boolean
        }
        Insert: {
          estado?: string
          fecha_inicio: string
          fecha_vencimiento?: string | null
          id_plan: number
          id_refugio: number
          id_suscripcion?: number
          renovacion_automatica?: boolean
        }
        Update: {
          estado?: string
          fecha_inicio?: string
          fecha_vencimiento?: string | null
          id_plan?: number
          id_refugio?: number
          id_suscripcion?: number
          renovacion_automatica?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_suscripcion_plan"
            columns: ["id_plan"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id_plan"]
          },
          {
            foreignKeyName: "fk_suscripcion_refugio"
            columns: ["id_refugio"]
            isOneToOne: true
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
        ]
      }
      traslado: {
        Row: {
          fecha_traslado: string
          id_animal: number
          id_espacio_destino: number
          id_espacio_origen: number
          id_refugio: number | null
          id_traslado: number
          id_usuario: number | null
          motivo: string | null
        }
        Insert: {
          fecha_traslado?: string
          id_animal: number
          id_espacio_destino: number
          id_espacio_origen: number
          id_refugio?: number | null
          id_traslado?: number
          id_usuario?: number | null
          motivo?: string | null
        }
        Update: {
          fecha_traslado?: string
          id_animal?: number
          id_espacio_destino?: number
          id_espacio_origen?: number
          id_refugio?: number | null
          id_traslado?: number
          id_usuario?: number | null
          motivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_traslado_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "fk_traslado_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal_adopcion_publica"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "fk_traslado_destino"
            columns: ["id_espacio_destino"]
            isOneToOne: false
            referencedRelation: "espacio"
            referencedColumns: ["id_espacio"]
          },
          {
            foreignKeyName: "fk_traslado_origen"
            columns: ["id_espacio_origen"]
            isOneToOne: false
            referencedRelation: "espacio"
            referencedColumns: ["id_espacio"]
          },
          {
            foreignKeyName: "traslado_id_refugio_fkey"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "traslado_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      usuario: {
        Row: {
          activo: boolean
          auth_user_id: string | null
          correo: string
          debe_cambiar_password: boolean
          fecha_creacion: string
          id_refugio: number | null
          id_usuario: number
          nombre_completo: string
          primer_inicio_sesion: boolean
          rol: number
          ultimo_login: string | null
        }
        Insert: {
          activo?: boolean
          auth_user_id?: string | null
          correo: string
          debe_cambiar_password?: boolean
          fecha_creacion?: string
          id_refugio?: number | null
          id_usuario?: number
          nombre_completo: string
          primer_inicio_sesion?: boolean
          rol?: number
          ultimo_login?: string | null
        }
        Update: {
          activo?: boolean
          auth_user_id?: string | null
          correo?: string
          debe_cambiar_password?: boolean
          fecha_creacion?: string
          id_refugio?: number | null
          id_usuario?: number
          nombre_completo?: string
          primer_inicio_sesion?: boolean
          rol?: number
          ultimo_login?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_usuario_refugio"
            columns: ["id_refugio"]
            isOneToOne: false
            referencedRelation: "refugio"
            referencedColumns: ["id_refugio"]
          },
          {
            foreignKeyName: "usuario_rol_fkey"
            columns: ["rol"]
            isOneToOne: false
            referencedRelation: "rol"
            referencedColumns: ["id_rol"]
          },
        ]
      }
      usuario_rol: {
        Row: {
          id_rol: number
          id_usuario: number
          id_usuario_rol: number
        }
        Insert: {
          id_rol: number
          id_usuario: number
          id_usuario_rol?: number
        }
        Update: {
          id_rol?: number
          id_usuario?: number
          id_usuario_rol?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_usuariorol_rol"
            columns: ["id_rol"]
            isOneToOne: false
            referencedRelation: "rol"
            referencedColumns: ["id_rol"]
          },
          {
            foreignKeyName: "fk_usuariorol_usuario"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
    }
    Views: {
      animal_adopcion_publica: {
        Row: {
          color: string | null
          compatibilidad: Json | null
          descripcion_publica: string | null
          desparasitado: boolean | null
          edad_estimada: number | null
          especie: string | null
          esterilizado: boolean | null
          fecha_publicacion: string | null
          foto_principal: string | null
          fotos: Json | null
          id_animal: number | null
          nombre: string | null
          rasgos_fisicos: string | null
          raza: string | null
          refugio: Json | null
          sexo: string | null
          tamano: string | null
          temperamento: string | null
          vacunado: boolean | null
        }
        Relationships: []
      }
      campana_publica: {
        Row: {
          animales: Json | null
          contenido: string | null
          fecha_publicacion: string | null
          hashtags: string[] | null
          id_campana: number | null
          llamado_accion: string | null
          refugio_ciudad: string | null
          refugio_estado: string | null
          refugio_nombre: string | null
          titulo: string | null
        }
        Relationships: []
      }
      refugio_publico: {
        Row: {
          adoptables: number | null
          ciudad: string | null
          correo_contacto: string | null
          descripcion_publica: string | null
          estado: string | null
          nombre: string | null
          slug: string | null
          telefono: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cambiar_estado_solicitud_adopcion: {
        Args: {
          p_estado_solicitud: string
          p_id_solicitud: number
          p_id_usuario?: number
          p_motivo?: string
        }
        Returns: Json
      }
      campanas_es_superadmin: { Args: never; Returns: boolean }
      campanas_refugio_usuario: { Args: never; Returns: number }
      completar_adopcion: {
        Args: {
          p_fecha_adopcion: string
          p_id_solicitud: number
          p_id_usuario?: number
          p_observaciones?: string
        }
        Returns: Json
      }
      current_refugio_id: { Args: never; Returns: number }
      current_user_is_admin: { Args: never; Returns: boolean }
      current_user_is_superadmin: { Args: never; Returns: boolean }
      evaluar_aptitud_adopcion: { Args: { p_id_animal: number }; Returns: Json }
      publicar_adopcion: {
        Args: {
          p_autorizar_excepcion: boolean
          p_disponible: boolean
          p_id_animal: number
          p_id_usuario: number
          p_motivo_excepcion: string
        }
        Returns: Json
      }
      publicar_perfil_adopcion: {
        Args: {
          p_descripcion_publica?: string
          p_id_animal: number
          p_id_usuario?: number
          p_publicado?: boolean
        }
        Returns: Json
      }
      registrar_alta_cuarentena: {
        Args: {
          p_fecha_alta: string
          p_id_animal: number
          p_id_usuario: number
          p_observaciones: string
        }
        Returns: Json
      }
      registrar_cirugia_reproductiva: {
        Args: {
          p_exitosa: boolean
          p_fecha_cirugia: string
          p_id_animal: number
          p_id_usuario: number
          p_insumos: Json
          p_notas_postoperatorias: string
          p_tipo_cirugia: string
        }
        Returns: Json
      }
      registrar_evaluacion_temperamento: {
        Args: {
          p_apto_gatos: string
          p_apto_ninos: string
          p_apto_perros: string
          p_comportamiento: string
          p_fecha_evaluacion?: string
          p_id_animal: number
          p_id_usuario?: number
          p_nivel_energia: string
        }
        Returns: Json
      }
      registrar_evento_sanitario: {
        Args: {
          p_esquema_completo?: boolean
          p_fecha_aplicacion: string
          p_fecha_refuerzo?: string
          p_id_animal: number
          p_id_lote_inventario?: number
          p_id_usuario?: number
          p_marca_lote?: string
          p_observaciones?: string
          p_tipo_biologico: string
          p_tipo_evento: string
        }
        Returns: Json
      }
      registrar_solicitud_adopcion: {
        Args: {
          p_acepta_politica_privacidad?: boolean
          p_comentarios_generales?: string
          p_correo: string
          p_declara_mayor_edad?: boolean
          p_direccion: string
          p_espacio_techado: boolean
          p_experiencia_mascotas?: string
          p_id_animal: number
          p_motivo_adopcion?: string
          p_nombre_completo: string
          p_telefono: string
          p_tiempo_solo_horas?: number
          p_tiene_ninos: boolean
          p_tiene_otras_mascotas: boolean
        }
        Returns: Json
      }
      registrar_traslado: {
        Args: {
          p_alta_fecha?: string
          p_alta_observaciones?: string
          p_id_animal: number
          p_id_espacio_destino: number
          p_id_usuario?: number
          p_motivo?: string
        }
        Returns: Json
      }
    }
    Enums: {
      bloque_tipo:
        | "hero"
        | "texto"
        | "galeria"
        | "animales"
        | "contacto"
        | "mapa"
        | "redes"
        | "donacion"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      bloque_tipo: [
        "hero",
        "texto",
        "galeria",
        "animales",
        "contacto",
        "mapa",
        "redes",
        "donacion",
      ],
    },
  },
} as const
