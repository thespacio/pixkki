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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adoptante: {
        Row: {
          acepta_politica_privacidad: boolean
          correo: string
          direccion: string
          espacio_techado: boolean
          fecha_registro: string
          id_adoptante: number
          id_refugio: number
          nombre_completo: string
          telefono: string
          tiempo_solo_horas: number | null
          tiene_otras_mascotas: boolean
        }
        Insert: {
          acepta_politica_privacidad?: boolean
          correo: string
          direccion: string
          espacio_techado?: boolean
          fecha_registro?: string
          id_adoptante?: number
          id_refugio: number
          nombre_completo: string
          telefono: string
          tiempo_solo_horas?: number | null
          tiene_otras_mascotas?: boolean
        }
        Update: {
          acepta_politica_privacidad?: boolean
          correo?: string
          direccion?: string
          espacio_techado?: boolean
          fecha_registro?: string
          id_adoptante?: number
          id_refugio?: number
          nombre_completo?: string
          telefono?: string
          tiempo_solo_horas?: number | null
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
      animal: {
        Row: {
          activo: boolean
          deleted_at: string | null
          disponible_adopcion: boolean
          edad_estimada: number | null
          en_cuarentena: boolean
          especie: string
          estado_inicial: string
          esterilizado: boolean
          fecha_ingreso: string
          id_animal: number
          id_espacio: number
          id_estado: number
          id_refugio: number
          nombre: string | null
          peso: number | null
          procedencia: string
          rasgos_fisicos: string
          raza: string | null
          sexo: string | null
          uuid: string | null
        }
        Insert: {
          activo?: boolean
          deleted_at?: string | null
          disponible_adopcion?: boolean
          edad_estimada?: number | null
          en_cuarentena?: boolean
          especie: string
          estado_inicial: string
          esterilizado?: boolean
          fecha_ingreso?: string
          id_animal?: number
          id_espacio: number
          id_estado: number
          id_refugio: number
          nombre?: string | null
          peso?: number | null
          procedencia: string
          rasgos_fisicos: string
          raza?: string | null
          sexo?: string | null
          uuid?: string | null
        }
        Update: {
          activo?: boolean
          deleted_at?: string | null
          disponible_adopcion?: boolean
          edad_estimada?: number | null
          en_cuarentena?: boolean
          especie?: string
          estado_inicial?: string
          esterilizado?: boolean
          fecha_ingreso?: string
          id_animal?: number
          id_espacio?: number
          id_estado?: number
          id_refugio?: number
          nombre?: string | null
          peso?: number | null
          procedencia?: string
          rasgos_fisicos?: string
          raza?: string | null
          sexo?: string | null
          uuid?: string | null
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
      cirugia_reproductiva: {
        Row: {
          exitosa: boolean
          fecha_cirugia: string
          id_animal: number
          id_cirugia: number
          id_usuario: number
          notas_postoperatorias: string | null
          tipo_cirugia: string
        }
        Insert: {
          exitosa?: boolean
          fecha_cirugia: string
          id_animal: number
          id_cirugia?: number
          id_usuario: number
          notas_postoperatorias?: string | null
          tipo_cirugia: string
        }
        Update: {
          exitosa?: boolean
          fecha_cirugia?: string
          id_animal?: number
          id_cirugia?: number
          id_usuario?: number
          notas_postoperatorias?: string | null
          tipo_cirugia?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cirugia_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
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
          id_solicitud?: number
          id_usuario?: number
          puntuacion?: number | null
          resultado?: string
          tipo_evaluacion?: string
        }
        Relationships: [
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
          id_usuario?: number
          nivel_energia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_temp_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
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
      fotografia: {
        Row: {
          es_principal: boolean
          fecha_subida: string
          formato: string | null
          id_animal: number
          id_fotografia: number
          nombre_archivo: string
          tamano_mb: number | null
          url_archivo: string
        }
        Insert: {
          es_principal?: boolean
          fecha_subida?: string
          formato?: string | null
          id_animal: number
          id_fotografia?: number
          nombre_archivo: string
          tamano_mb?: number | null
          url_archivo: string
        }
        Update: {
          es_principal?: boolean
          fecha_subida?: string
          formato?: string | null
          id_animal?: number
          id_fotografia?: number
          nombre_archivo?: string
          tamano_mb?: number | null
          url_archivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_foto_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
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
          estado: string
          fecha_registro: string
          id_refugio: number
          nombre: string
          numero: string | null
          telefono: string | null
        }
        Insert: {
          activo?: boolean
          calle?: string | null
          ciudad: string
          codigo_postal?: string | null
          colonia?: string | null
          correo_contacto: string
          estado: string
          fecha_registro?: string
          id_refugio?: number
          nombre: string
          numero?: string | null
          telefono?: string | null
        }
        Update: {
          activo?: boolean
          calle?: string | null
          ciudad?: string
          codigo_postal?: string | null
          colonia?: string | null
          correo_contacto?: string
          estado?: string
          fecha_registro?: string
          id_refugio?: number
          nombre?: string
          numero?: string | null
          telefono?: string | null
        }
        Relationships: []
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
          comentarios_generales: string | null
          estado_solicitud: string
          fecha_solicitud: string
          id_adoptante: number
          id_animal: number
          id_solicitud: number
          motivo_adopcion: string | null
        }
        Insert: {
          comentarios_generales?: string | null
          estado_solicitud?: string
          fecha_solicitud?: string
          id_adoptante: number
          id_animal: number
          id_solicitud?: number
          motivo_adopcion?: string | null
        }
        Update: {
          comentarios_generales?: string | null
          estado_solicitud?: string
          fecha_solicitud?: string
          id_adoptante?: number
          id_animal?: number
          id_solicitud?: number
          motivo_adopcion?: string | null
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
          id_traslado: number
          motivo: string | null
        }
        Insert: {
          fecha_traslado?: string
          id_animal: number
          id_espacio_destino: number
          id_espacio_origen: number
          id_traslado?: number
          motivo?: string | null
        }
        Update: {
          fecha_traslado?: string
          id_animal?: number
          id_espacio_destino?: number
          id_espacio_origen?: number
          id_traslado?: number
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
        ]
      }
      usuario: {
        Row: {
          activo: boolean
          auth_user_id: string | null
          correo: string
          fecha_creacion: string
          id_refugio: number
          id_usuario: number
          nombre_completo: string
          rol: number
          ultimo_login: string | null
        }
        Insert: {
          activo?: boolean
          auth_user_id?: string | null
          correo: string
          fecha_creacion?: string
          id_refugio: number
          id_usuario?: number
          nombre_completo: string
          rol?: number
          ultimo_login?: string | null
        }
        Update: {
          activo?: boolean
          auth_user_id?: string | null
          correo?: string
          fecha_creacion?: string
          id_refugio?: number
          id_usuario?: number
          nombre_completo?: string
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
      vacunacion: {
        Row: {
          esquema_completo: boolean
          fecha_aplicacion: string
          fecha_refuerzo: string | null
          id_animal: number
          id_usuario: number
          id_vacunacion: number
          marca_lote: string | null
          observaciones: string | null
          tipo_biologico: string
        }
        Insert: {
          esquema_completo?: boolean
          fecha_aplicacion?: string
          fecha_refuerzo?: string | null
          id_animal: number
          id_usuario: number
          id_vacunacion?: number
          marca_lote?: string | null
          observaciones?: string | null
          tipo_biologico: string
        }
        Update: {
          esquema_completo?: boolean
          fecha_aplicacion?: string
          fecha_refuerzo?: string | null
          id_animal?: number
          id_usuario?: number
          id_vacunacion?: number
          marca_lote?: string | null
          observaciones?: string | null
          tipo_biologico?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_vacuna_animal"
            columns: ["id_animal"]
            isOneToOne: false
            referencedRelation: "animal"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
