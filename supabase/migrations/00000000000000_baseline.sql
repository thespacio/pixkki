-- ============================================================================
-- BASELINE del esquema público (snapshot del proyecto remoto)
-- ============================================================================
-- Generado con: supabase db dump --linked --schema public
-- Fecha: 2026-11-16
--
-- Contiene el esquema que ya existía en la base ANTES de las migraciones
-- versionadas (tablas base, tipos, funciones, políticas RLS e índices).
-- Sirve para que supabase db reset pueda reconstruir la base desde cero.
--
-- IMPORTANTE:
--   * Es la primera migración (version 00000000000000). No renombrar.
--   * Ya está aplicado en el proyecto remoto; su historial se marcó como
--     applied con supabase migration repair --status applied 00000000000000.
--   * Las migraciones posteriores son idempotentes y se aplican encima.
-- ============================================================================

begin;



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."bloque_tipo" AS ENUM (
    'hero',
    'texto',
    'galeria',
    'animales',
    'contacto',
    'mapa',
    'redes',
    'donacion'
);


ALTER TYPE "public"."bloque_tipo" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."campanas_es_superadmin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.usuario u
    join public.rol r on r.id_rol = u.rol
    where u.auth_user_id = auth.uid()
      and u.activo
      and r.nombre_rol = 'Superadmin'
  );
$$;


ALTER FUNCTION "public"."campanas_es_superadmin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."campanas_refugio_usuario"() RETURNS integer
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select u.id_refugio
  from public.usuario u
  where u.auth_user_id = auth.uid()
    and u.activo
  limit 1;
$$;


ALTER FUNCTION "public"."campanas_refugio_usuario"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."aceptacion_terminos" (
    "id_aceptacion" bigint NOT NULL,
    "id_usuario" integer NOT NULL,
    "id_refugio" integer,
    "terminos_version" "text" NOT NULL,
    "aceptado_en" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "aceptacion_terminos_terminos_version_check" CHECK ((("char_length"("terminos_version") >= 1) AND ("char_length"("terminos_version") <= 20)))
);


ALTER TABLE "public"."aceptacion_terminos" OWNER TO "postgres";


ALTER TABLE "public"."aceptacion_terminos" ALTER COLUMN "id_aceptacion" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."aceptacion_terminos_id_aceptacion_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."adoptante" (
    "id_adoptante" integer NOT NULL,
    "id_refugio" integer NOT NULL,
    "nombre_completo" character varying(150) NOT NULL,
    "telefono" character varying(20) NOT NULL,
    "correo" character varying(150) NOT NULL,
    "direccion" character varying(255) NOT NULL,
    "tiene_otras_mascotas" boolean DEFAULT false NOT NULL,
    "espacio_techado" boolean DEFAULT false NOT NULL,
    "tiempo_solo_horas" integer,
    "acepta_politica_privacidad" boolean DEFAULT false NOT NULL,
    "fecha_registro" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_adoptante_horas" CHECK ((("tiempo_solo_horas" >= 0) AND ("tiempo_solo_horas" <= 24)))
);


ALTER TABLE "public"."adoptante" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."adoptante_id_adoptante_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."adoptante_id_adoptante_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."adoptante_id_adoptante_seq" OWNED BY "public"."adoptante"."id_adoptante";



CREATE TABLE IF NOT EXISTS "public"."albergue_bloque" (
    "id_bloque" integer NOT NULL,
    "id_perfil" integer NOT NULL,
    "tipo" "public"."bloque_tipo" NOT NULL,
    "orden" integer DEFAULT 0 NOT NULL,
    "visible" boolean DEFAULT true NOT NULL,
    "contenido" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "fecha_creacion" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_bloque_tipo" CHECK (("tipo" = ANY (ARRAY['hero'::"public"."bloque_tipo", 'texto'::"public"."bloque_tipo", 'galeria'::"public"."bloque_tipo", 'animales'::"public"."bloque_tipo", 'contacto'::"public"."bloque_tipo", 'mapa'::"public"."bloque_tipo", 'redes'::"public"."bloque_tipo", 'donacion'::"public"."bloque_tipo"])))
);


ALTER TABLE "public"."albergue_bloque" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."albergue_bloque_id_bloque_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."albergue_bloque_id_bloque_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."albergue_bloque_id_bloque_seq" OWNED BY "public"."albergue_bloque"."id_bloque";



CREATE TABLE IF NOT EXISTS "public"."albergue_perfil" (
    "id_perfil" integer NOT NULL,
    "id_refugio" integer NOT NULL,
    "slug" character varying(100) NOT NULL,
    "visible_publico" boolean DEFAULT false NOT NULL,
    "color_primario" character varying(7) DEFAULT '#43AE6D'::character varying,
    "color_secundario" character varying(7) DEFAULT '#FFFFFF'::character varying,
    "logo_url" character varying(500),
    "portada_url" character varying(500),
    "descripcion_corta" character varying(255),
    "fecha_actualizacion" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."albergue_perfil" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."albergue_perfil_id_perfil_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."albergue_perfil_id_perfil_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."albergue_perfil_id_perfil_seq" OWNED BY "public"."albergue_perfil"."id_perfil";



CREATE TABLE IF NOT EXISTS "public"."altas_cuarentena" (
    "id_alta" bigint NOT NULL,
    "id_animal" integer NOT NULL,
    "id_refugio" integer NOT NULL,
    "observaciones" "text" NOT NULL,
    "id_usuario_veterinario" integer NOT NULL,
    "fecha_alta" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."altas_cuarentena" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."altas_cuarentena_id_alta_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."altas_cuarentena_id_alta_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."altas_cuarentena_id_alta_seq" OWNED BY "public"."altas_cuarentena"."id_alta";



CREATE TABLE IF NOT EXISTS "public"."animal" (
    "id_animal" integer NOT NULL,
    "id_refugio" integer NOT NULL,
    "id_estado" integer NOT NULL,
    "id_espacio" integer NOT NULL,
    "nombre" character varying(100),
    "especie" character varying(50) NOT NULL,
    "raza" character varying(100),
    "sexo" character(1),
    "edad_estimada" integer,
    "peso" numeric(5,2),
    "procedencia" character varying(255) NOT NULL,
    "rasgos_fisicos" "text" NOT NULL,
    "estado_inicial" "text" NOT NULL,
    "en_cuarentena" boolean DEFAULT false NOT NULL,
    "esterilizado" boolean DEFAULT false NOT NULL,
    "disponible_adopcion" boolean DEFAULT false NOT NULL,
    "fecha_ingreso" timestamp without time zone DEFAULT "now"() NOT NULL,
    "activo" boolean DEFAULT true NOT NULL,
    "uuid" "text",
    "deleted_at" timestamp without time zone,
    "color" "text",
    "tamano" "text",
    "microchip" "text",
    "temperamento" "text",
    "vacunado" boolean DEFAULT false NOT NULL,
    "desparasitado" boolean DEFAULT false NOT NULL,
    "lugar_rescate" "text",
    "fecha_rescate" "date",
    "situacion_rescate" "text",
    "rescatista_nombre" "text",
    "rescatista_contacto" "text",
    "observaciones" "text",
    CONSTRAINT "animal_sexo_check" CHECK (("sexo" = ANY (ARRAY['M'::"bpchar", 'H'::"bpchar"]))),
    CONSTRAINT "animal_tamano_check" CHECK ((("tamano" IS NULL) OR ("tamano" = ANY (ARRAY['Pequeño'::"text", 'Mediano'::"text", 'Grande'::"text"])))),
    CONSTRAINT "chk_animal_activo" CHECK (("activo" = ANY (ARRAY[true, false]))),
    CONSTRAINT "chk_animal_adopcion" CHECK (("disponible_adopcion" = ANY (ARRAY[true, false]))),
    CONSTRAINT "chk_animal_cuarentena" CHECK (("en_cuarentena" = ANY (ARRAY[true, false]))),
    CONSTRAINT "chk_animal_especie" CHECK ((("especie")::"text" = ANY ((ARRAY['Perro'::character varying, 'Gato'::character varying])::"text"[]))),
    CONSTRAINT "chk_animal_esterilizado" CHECK (("esterilizado" = ANY (ARRAY[true, false]))),
    CONSTRAINT "chk_animal_peso" CHECK (("peso" > (0)::numeric))
);


ALTER TABLE "public"."animal" OWNER TO "postgres";


COMMENT ON COLUMN "public"."animal"."lugar_rescate" IS 'Dirección o referencia donde se encontró al animal';



COMMENT ON COLUMN "public"."animal"."fecha_rescate" IS 'Fecha en que fue rescatado';



COMMENT ON COLUMN "public"."animal"."situacion_rescate" IS 'Abandonado, Extraviado, Maltratado, Nacido en la calle, Accidentado u Otro';



COMMENT ON COLUMN "public"."animal"."rescatista_nombre" IS 'Persona que lo reportó o entregó';



COMMENT ON COLUMN "public"."animal"."rescatista_contacto" IS 'Teléfono o correo de quien lo reportó';



CREATE TABLE IF NOT EXISTS "public"."animal_estado" (
    "id_estado" integer NOT NULL,
    "nombre_estado" character varying(80) NOT NULL,
    "descripcion" character varying(255)
);


ALTER TABLE "public"."animal_estado" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."animal_estado_id_estado_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."animal_estado_id_estado_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."animal_estado_id_estado_seq" OWNED BY "public"."animal_estado"."id_estado";



CREATE SEQUENCE IF NOT EXISTS "public"."animal_id_animal_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."animal_id_animal_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."animal_id_animal_seq" OWNED BY "public"."animal"."id_animal";



CREATE TABLE IF NOT EXISTS "public"."auditoria" (
    "id_auditoria" bigint NOT NULL,
    "id_usuario" integer NOT NULL,
    "id_refugio" integer NOT NULL,
    "accion" character varying(100) NOT NULL,
    "modulo" character varying(50) NOT NULL,
    "entidad_id" integer,
    "descripcion" "text",
    "ip_origen" character varying(45),
    "fecha_evento" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."auditoria" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."auditoria_id_auditoria_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."auditoria_id_auditoria_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."auditoria_id_auditoria_seq" OWNED BY "public"."auditoria"."id_auditoria";



CREATE TABLE IF NOT EXISTS "public"."campana" (
    "id_campana" bigint NOT NULL,
    "id_refugio" integer NOT NULL,
    "titulo" "text" NOT NULL,
    "contenido" "text" NOT NULL,
    "hashtags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "llamado_accion" "text",
    "estado" "text" DEFAULT 'borrador'::"text" NOT NULL,
    "generada_por_ia" boolean DEFAULT false NOT NULL,
    "modelo_ia" "text",
    "id_usuario_creador" integer,
    "fecha_creacion" timestamp with time zone DEFAULT "now"() NOT NULL,
    "fecha_actualizacion" timestamp with time zone DEFAULT "now"() NOT NULL,
    "fecha_publicacion" timestamp with time zone,
    CONSTRAINT "campana_contenido_check" CHECK ((("char_length"("contenido") >= 10) AND ("char_length"("contenido") <= 1500))),
    CONSTRAINT "campana_estado_check" CHECK (("estado" = ANY (ARRAY['borrador'::"text", 'publicada'::"text", 'archivada'::"text"]))),
    CONSTRAINT "campana_llamado_accion_check" CHECK ((("llamado_accion" IS NULL) OR ("char_length"("llamado_accion") <= 200))),
    CONSTRAINT "campana_titulo_check" CHECK ((("char_length"("titulo") >= 3) AND ("char_length"("titulo") <= 120)))
);


ALTER TABLE "public"."campana" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."campana_animal" (
    "id_campana" bigint NOT NULL,
    "id_animal" integer NOT NULL
);


ALTER TABLE "public"."campana_animal" OWNER TO "postgres";


ALTER TABLE "public"."campana" ALTER COLUMN "id_campana" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."campana_id_campana_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE OR REPLACE VIEW "public"."campana_publica" AS
SELECT
    NULL::bigint AS "id_campana",
    NULL::"text" AS "titulo",
    NULL::"text" AS "contenido",
    NULL::"text"[] AS "hashtags",
    NULL::"text" AS "llamado_accion",
    NULL::timestamp with time zone AS "fecha_publicacion",
    NULL::character varying(150) AS "refugio_nombre",
    NULL::character varying(100) AS "refugio_ciudad",
    NULL::character varying(100) AS "refugio_estado",
    NULL::"jsonb" AS "animales";


ALTER VIEW "public"."campana_publica" OWNER TO "postgres";


COMMENT ON VIEW "public"."campana_publica" IS 'Campañas de adopción publicadas, visibles en la landing sin sesión. Solo campos no sensibles.';



CREATE TABLE IF NOT EXISTS "public"."chequeo_sintomas" (
    "id_chequeo" bigint NOT NULL,
    "sintoma" "text" NOT NULL,
    CONSTRAINT "chequeo_sintomas_sintoma_check" CHECK (("sintoma" = ANY (ARRAY['vomito'::"text", 'diarrea'::"text", 'letargia'::"text", 'secrecion_nasal_ocular'::"text", 'tos'::"text", 'otro'::"text"])))
);


ALTER TABLE "public"."chequeo_sintomas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chequeos_medicos" (
    "id_chequeo" bigint NOT NULL,
    "id_animal" integer NOT NULL,
    "id_refugio" integer NOT NULL,
    "peso_kg" numeric(6,2) NOT NULL,
    "temperatura_c" numeric(4,1) NOT NULL,
    "frecuencia_cardiaca" integer NOT NULL,
    "frecuencia_respiratoria" integer NOT NULL,
    "sintoma_otro_detalle" "text",
    "observaciones" "text",
    "id_usuario" integer NOT NULL,
    "fecha_chequeo" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chequeos_medicos_frecuencia_cardiaca_check" CHECK ((("frecuencia_cardiaca" >= 20) AND ("frecuencia_cardiaca" <= 300))),
    CONSTRAINT "chequeos_medicos_frecuencia_respiratoria_check" CHECK ((("frecuencia_respiratoria" >= 5) AND ("frecuencia_respiratoria" <= 150))),
    CONSTRAINT "chequeos_medicos_peso_kg_check" CHECK ((("peso_kg" > (0)::numeric) AND ("peso_kg" <= (200)::numeric))),
    CONSTRAINT "chequeos_medicos_temperatura_c_check" CHECK ((("temperatura_c" >= 30.0) AND ("temperatura_c" <= 45.0)))
);


ALTER TABLE "public"."chequeos_medicos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."chequeos_medicos_id_chequeo_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."chequeos_medicos_id_chequeo_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."chequeos_medicos_id_chequeo_seq" OWNED BY "public"."chequeos_medicos"."id_chequeo";



CREATE TABLE IF NOT EXISTS "public"."cirugia_reproductiva" (
    "id_cirugia" integer NOT NULL,
    "id_animal" integer NOT NULL,
    "id_usuario" integer NOT NULL,
    "tipo_cirugia" character varying(30) NOT NULL,
    "fecha_cirugia" timestamp without time zone NOT NULL,
    "notas_postoperatorias" "text",
    "exitosa" boolean DEFAULT true NOT NULL,
    CONSTRAINT "chk_cirugia_tipo" CHECK ((("tipo_cirugia")::"text" = ANY ((ARRAY['Esterilización'::character varying, 'Castración'::character varying])::"text"[])))
);


ALTER TABLE "public"."cirugia_reproductiva" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."cirugia_reproductiva_id_cirugia_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."cirugia_reproductiva_id_cirugia_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."cirugia_reproductiva_id_cirugia_seq" OWNED BY "public"."cirugia_reproductiva"."id_cirugia";



CREATE TABLE IF NOT EXISTS "public"."diagnostico_veterinario" (
    "id_diagnostico" integer NOT NULL,
    "id_animal" integer NOT NULL,
    "id_usuario" integer NOT NULL,
    "estado_general" character varying(20) NOT NULL,
    "descripcion" "text" NOT NULL,
    "requiere_cuarentena" boolean DEFAULT false NOT NULL,
    "requiere_cirugia" boolean DEFAULT false NOT NULL,
    "tratamiento_inicial" "text",
    "fecha_diagnostico" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_dx_estado" CHECK ((("estado_general")::"text" = ANY ((ARRAY['Crítico'::character varying, 'Delicado'::character varying, 'Estable'::character varying, 'Sano'::character varying])::"text"[])))
);


ALTER TABLE "public"."diagnostico_veterinario" OWNER TO "postgres";


COMMENT ON COLUMN "public"."diagnostico_veterinario"."estado_general" IS 'Categoría exclusiva del diagnóstico de ingreso: Crítico, Delicado, Estable o Sano';



CREATE SEQUENCE IF NOT EXISTS "public"."diagnostico_veterinario_id_diagnostico_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."diagnostico_veterinario_id_diagnostico_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."diagnostico_veterinario_id_diagnostico_seq" OWNED BY "public"."diagnostico_veterinario"."id_diagnostico";



CREATE TABLE IF NOT EXISTS "public"."donacion" (
    "id_donacion" integer NOT NULL,
    "id_donante" integer NOT NULL,
    "id_refugio" integer NOT NULL,
    "tipo_donacion" character varying(50) NOT NULL,
    "descripcion" character varying(255) NOT NULL,
    "cantidad" numeric(10,2) NOT NULL,
    "unidad_medida" character varying(20) NOT NULL,
    "fecha_donacion" timestamp without time zone DEFAULT "now"() NOT NULL,
    "caducidad" "date",
    CONSTRAINT "chk_donacion_cantidad" CHECK (("cantidad" > (0)::numeric)),
    CONSTRAINT "chk_donacion_tipo" CHECK ((("tipo_donacion")::"text" = ANY ((ARRAY['Alimento'::character varying, 'Medicamento'::character varying, 'Equipo'::character varying, 'Ropa'::character varying, 'Otro'::character varying])::"text"[])))
);


ALTER TABLE "public"."donacion" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."donacion_id_donacion_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."donacion_id_donacion_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."donacion_id_donacion_seq" OWNED BY "public"."donacion"."id_donacion";



CREATE TABLE IF NOT EXISTS "public"."donante" (
    "id_donante" integer NOT NULL,
    "nombre_completo" character varying(150) NOT NULL,
    "telefono" character varying(20),
    "correo" character varying(150),
    "tipo_donante" character varying(30) NOT NULL,
    "notas" "text",
    "fecha_registro" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_donante_tipo" CHECK ((("tipo_donante")::"text" = ANY ((ARRAY['Persona'::character varying, 'Empresa'::character varying, 'Fundación'::character varying])::"text"[])))
);


ALTER TABLE "public"."donante" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."donante_id_donante_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."donante_id_donante_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."donante_id_donante_seq" OWNED BY "public"."donante"."id_donante";



CREATE TABLE IF NOT EXISTS "public"."espacio" (
    "id_espacio" integer NOT NULL,
    "id_refugio" integer NOT NULL,
    "nombre_espacio" character varying(100) NOT NULL,
    "tipo" "text",
    "capacidad" integer NOT NULL,
    "disponible" boolean DEFAULT true NOT NULL,
    "descripcion" character varying(255),
    CONSTRAINT "chk_espacio_capacidad" CHECK (("capacidad" > 0))
);


ALTER TABLE "public"."espacio" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."espacio_id_espacio_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."espacio_id_espacio_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."espacio_id_espacio_seq" OWNED BY "public"."espacio"."id_espacio";



CREATE TABLE IF NOT EXISTS "public"."evaluacion_adopcion" (
    "id_evaluacion_adopcion" integer NOT NULL,
    "id_solicitud" integer NOT NULL,
    "id_usuario" integer NOT NULL,
    "tipo_evaluacion" character varying(50) NOT NULL,
    "resultado" character varying(30) DEFAULT 'Pendiente'::character varying NOT NULL,
    "puntuacion" numeric(4,2),
    "comentarios" "text",
    "fecha_evaluacion" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_eval_resultado" CHECK ((("resultado")::"text" = ANY ((ARRAY['Pendiente'::character varying, 'Aprobada'::character varying, 'Rechazada'::character varying])::"text"[]))),
    CONSTRAINT "chk_eval_tipo" CHECK ((("tipo_evaluacion")::"text" = ANY ((ARRAY['Documentación'::character varying, 'Entrevista'::character varying, 'Visita domiciliaria'::character varying, 'Convivencia'::character varying, 'Evaluación final'::character varying])::"text"[])))
);


ALTER TABLE "public"."evaluacion_adopcion" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."evaluacion_adopcion_id_evaluacion_adopcion_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."evaluacion_adopcion_id_evaluacion_adopcion_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."evaluacion_adopcion_id_evaluacion_adopcion_seq" OWNED BY "public"."evaluacion_adopcion"."id_evaluacion_adopcion";



CREATE TABLE IF NOT EXISTS "public"."evaluacion_temperamento" (
    "id_evaluacion_temperamento" integer NOT NULL,
    "id_animal" integer NOT NULL,
    "id_usuario" integer NOT NULL,
    "apto_ninos" character varying(20),
    "apto_perros" character varying(20),
    "apto_gatos" character varying(20),
    "nivel_energia" character varying(20),
    "comportamiento" "text",
    "fecha_evaluacion" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_temp_energia" CHECK ((("nivel_energia")::"text" = ANY ((ARRAY['Bajo'::character varying, 'Medio'::character varying, 'Alto'::character varying])::"text"[]))),
    CONSTRAINT "chk_temp_gatos" CHECK ((("apto_gatos")::"text" = ANY ((ARRAY['Sí'::character varying, 'No'::character varying, 'En evaluación'::character varying])::"text"[]))),
    CONSTRAINT "chk_temp_ninos" CHECK ((("apto_ninos")::"text" = ANY ((ARRAY['Sí'::character varying, 'No'::character varying, 'En evaluación'::character varying])::"text"[]))),
    CONSTRAINT "chk_temp_perros" CHECK ((("apto_perros")::"text" = ANY ((ARRAY['Sí'::character varying, 'No'::character varying, 'En evaluación'::character varying])::"text"[])))
);


ALTER TABLE "public"."evaluacion_temperamento" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."evaluacion_temperamento_id_evaluacion_temperamento_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."evaluacion_temperamento_id_evaluacion_temperamento_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."evaluacion_temperamento_id_evaluacion_temperamento_seq" OWNED BY "public"."evaluacion_temperamento"."id_evaluacion_temperamento";



CREATE TABLE IF NOT EXISTS "public"."evento_sanitario" (
    "id_evento" integer NOT NULL,
    "id_animal" integer NOT NULL,
    "id_usuario" integer NOT NULL,
    "tipo_biologico" character varying(100) NOT NULL,
    "marca_lote" character varying(100),
    "fecha_aplicacion" timestamp without time zone DEFAULT "now"() NOT NULL,
    "fecha_refuerzo" timestamp without time zone,
    "esquema_completo" boolean DEFAULT false NOT NULL,
    "observaciones" "text",
    "id_refugio" integer,
    "tipo_evento" "text" DEFAULT 'vacunacion'::"text" NOT NULL,
    "id_lote_inventario" integer,
    "cantidad" integer DEFAULT 1 NOT NULL,
    "fecha_registro" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "evento_sanitario_tipo_evento_check" CHECK (("tipo_evento" = ANY (ARRAY['vacunacion'::"text", 'desparasitacion'::"text"])))
);


ALTER TABLE "public"."evento_sanitario" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fotografia" (
    "id_fotografia" integer NOT NULL,
    "id_animal" integer NOT NULL,
    "url_archivo" character varying(500) NOT NULL,
    "nombre_archivo" character varying(255) NOT NULL,
    "formato" character varying(10),
    "tamano_mb" numeric(4,2),
    "es_principal" boolean DEFAULT false NOT NULL,
    "fecha_subida" timestamp without time zone DEFAULT "now"() NOT NULL,
    "public_id" "text",
    "url_thumbnail" "text",
    "orden" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "chk_foto_formato" CHECK ((("formato")::"text" = ANY ((ARRAY['JPG'::character varying, 'JPEG'::character varying, 'PNG'::character varying, 'WEBP'::character varying])::"text"[]))),
    CONSTRAINT "chk_foto_tamano" CHECK (("tamano_mb" > (0)::numeric))
);


ALTER TABLE "public"."fotografia" OWNER TO "postgres";


COMMENT ON COLUMN "public"."fotografia"."public_id" IS 'Identificador del archivo en Cloudinary (necesario para eliminarlo)';



COMMENT ON COLUMN "public"."fotografia"."url_thumbnail" IS 'URL de la transformación 300x300 de Cloudinary';



COMMENT ON COLUMN "public"."fotografia"."orden" IS 'Orden de presentación dentro de la galería del expediente';



CREATE SEQUENCE IF NOT EXISTS "public"."fotografia_id_fotografia_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."fotografia_id_fotografia_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."fotografia_id_fotografia_seq" OWNED BY "public"."fotografia"."id_fotografia";



CREATE TABLE IF NOT EXISTS "public"."historial_pago" (
    "id_pago" integer NOT NULL,
    "id_suscripcion" integer NOT NULL,
    "id_plan" integer NOT NULL,
    "monto" numeric(10,2) NOT NULL,
    "fecha_pago" timestamp without time zone DEFAULT "now"() NOT NULL,
    "estado_pago" character varying(20) NOT NULL,
    CONSTRAINT "chk_pago_estado" CHECK ((("estado_pago")::"text" = ANY ((ARRAY['exitoso'::character varying, 'fallido'::character varying, 'pendiente'::character varying, 'reembolsado'::character varying])::"text"[]))),
    CONSTRAINT "chk_pago_monto" CHECK (("monto" > (0)::numeric))
);


ALTER TABLE "public"."historial_pago" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."historial_pago_id_pago_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."historial_pago_id_pago_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."historial_pago_id_pago_seq" OWNED BY "public"."historial_pago"."id_pago";



CREATE TABLE IF NOT EXISTS "public"."invitacion_admin" (
    "id_invitacion" integer NOT NULL,
    "id_refugio" integer NOT NULL,
    "correo" character varying(150) NOT NULL,
    "token" character varying(100) NOT NULL,
    "usado" boolean DEFAULT false NOT NULL,
    "fecha_envio" timestamp without time zone DEFAULT "now"() NOT NULL,
    "fecha_expira" timestamp without time zone DEFAULT ("now"() + '7 days'::interval) NOT NULL
);


ALTER TABLE "public"."invitacion_admin" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."invitacion_admin_id_invitacion_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."invitacion_admin_id_invitacion_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."invitacion_admin_id_invitacion_seq" OWNED BY "public"."invitacion_admin"."id_invitacion";



CREATE TABLE IF NOT EXISTS "public"."permiso" (
    "id_permiso" integer NOT NULL,
    "nombre_permiso" character varying(120) NOT NULL,
    "descripcion" character varying(255)
);


ALTER TABLE "public"."permiso" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."permiso_id_permiso_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."permiso_id_permiso_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."permiso_id_permiso_seq" OWNED BY "public"."permiso"."id_permiso";



CREATE TABLE IF NOT EXISTS "public"."planes" (
    "id_plan" integer NOT NULL,
    "plan" character varying(50) NOT NULL,
    "precio_mensual" numeric(10,2) NOT NULL,
    "duracion_dias" integer NOT NULL,
    CONSTRAINT "chk_planes_duracion" CHECK (("duracion_dias" > 0)),
    CONSTRAINT "chk_planes_nombre" CHECK ((("plan")::"text" = ANY ((ARRAY['Básico mensual'::character varying, 'Pro trimestral'::character varying, 'Premium anual'::character varying, 'Básico anual'::character varying])::"text"[])))
);


ALTER TABLE "public"."planes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."planes_id_plan_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."planes_id_plan_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."planes_id_plan_seq" OWNED BY "public"."planes"."id_plan";



CREATE TABLE IF NOT EXISTS "public"."refugio" (
    "id_refugio" integer NOT NULL,
    "nombre" character varying(150) NOT NULL,
    "ciudad" character varying(100) NOT NULL,
    "estado" character varying(100) NOT NULL,
    "correo_contacto" character varying(150) NOT NULL,
    "telefono" character varying(20),
    "fecha_registro" timestamp without time zone DEFAULT "now"() NOT NULL,
    "activo" boolean DEFAULT true NOT NULL,
    "calle" "text",
    "numero" "text",
    "colonia" "text",
    "codigo_postal" "text",
    "direccion" "text",
    "latitud" numeric(9,6),
    "longitud" numeric(9,6),
    CONSTRAINT "chk_refugio_activo" CHECK (("activo" = ANY (ARRAY[true, false]))),
    CONSTRAINT "refugio_coordenadas_validas" CHECK (((("latitud" IS NULL) AND ("longitud" IS NULL)) OR ((("latitud" >= ('-90'::integer)::numeric) AND ("latitud" <= (90)::numeric)) AND (("longitud" >= ('-180'::integer)::numeric) AND ("longitud" <= (180)::numeric))))),
    CONSTRAINT "refugio_direccion_largo" CHECK ((("direccion" IS NULL) OR ("char_length"("direccion") <= 300)))
);


ALTER TABLE "public"."refugio" OWNER TO "postgres";


COMMENT ON COLUMN "public"."refugio"."calle" IS 'Calle de la dirección del refugio';



COMMENT ON COLUMN "public"."refugio"."numero" IS 'Número exterior/interior de la dirección';



COMMENT ON COLUMN "public"."refugio"."colonia" IS 'Colonia o barrio de la dirección';



COMMENT ON COLUMN "public"."refugio"."codigo_postal" IS 'Código postal de 5 dígitos';



CREATE SEQUENCE IF NOT EXISTS "public"."refugio_id_refugio_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."refugio_id_refugio_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."refugio_id_refugio_seq" OWNED BY "public"."refugio"."id_refugio";



CREATE TABLE IF NOT EXISTS "public"."rol" (
    "id_rol" integer NOT NULL,
    "nombre_rol" character varying(100) NOT NULL,
    "descripcion" character varying(255)
);


ALTER TABLE "public"."rol" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."rol_id_rol_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."rol_id_rol_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."rol_id_rol_seq" OWNED BY "public"."rol"."id_rol";



CREATE TABLE IF NOT EXISTS "public"."rol_permiso" (
    "id_rol_permiso" integer NOT NULL,
    "id_rol" integer NOT NULL,
    "id_permiso" integer NOT NULL
);


ALTER TABLE "public"."rol_permiso" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."rol_permiso_id_rol_permiso_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."rol_permiso_id_rol_permiso_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."rol_permiso_id_rol_permiso_seq" OWNED BY "public"."rol_permiso"."id_rol_permiso";



CREATE TABLE IF NOT EXISTS "public"."solicitud_adopcion" (
    "id_solicitud" integer NOT NULL,
    "id_adoptante" integer NOT NULL,
    "id_animal" integer NOT NULL,
    "estado_solicitud" character varying(30) DEFAULT 'Recibida'::character varying NOT NULL,
    "fecha_solicitud" timestamp without time zone DEFAULT "now"() NOT NULL,
    "motivo_adopcion" "text",
    "comentarios_generales" "text",
    CONSTRAINT "chk_solicitud_estado" CHECK ((("estado_solicitud")::"text" = ANY ((ARRAY['Recibida'::character varying, 'En entrevista'::character varying, 'En evaluación'::character varying, 'Aprobada'::character varying, 'Rechazada'::character varying, 'Cancelada'::character varying])::"text"[])))
);


ALTER TABLE "public"."solicitud_adopcion" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."solicitud_adopcion_id_solicitud_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."solicitud_adopcion_id_solicitud_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."solicitud_adopcion_id_solicitud_seq" OWNED BY "public"."solicitud_adopcion"."id_solicitud";



CREATE TABLE IF NOT EXISTS "public"."super_admin" (
    "id_superadmin" integer NOT NULL,
    "correo" character varying(150) NOT NULL,
    "auth_user_id" "uuid" NOT NULL,
    "activo" boolean DEFAULT true NOT NULL,
    "fecha_creacion" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."super_admin" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."super_admin_id_superadmin_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."super_admin_id_superadmin_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."super_admin_id_superadmin_seq" OWNED BY "public"."super_admin"."id_superadmin";



CREATE TABLE IF NOT EXISTS "public"."suscripcion" (
    "id_suscripcion" integer NOT NULL,
    "id_refugio" integer NOT NULL,
    "id_plan" integer NOT NULL,
    "fecha_inicio" "date" NOT NULL,
    "fecha_vencimiento" "date",
    "estado" character varying(20) DEFAULT 'Activa'::character varying NOT NULL,
    "renovacion_automatica" boolean DEFAULT false NOT NULL,
    CONSTRAINT "chk_suscripcion_estado" CHECK ((("estado")::"text" = ANY ((ARRAY['Activa'::character varying, 'Vencida'::character varying, 'Cancelada'::character varying, 'Suspendida'::character varying])::"text"[])))
);


ALTER TABLE "public"."suscripcion" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."suscripcion_id_suscripcion_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."suscripcion_id_suscripcion_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."suscripcion_id_suscripcion_seq" OWNED BY "public"."suscripcion"."id_suscripcion";



CREATE TABLE IF NOT EXISTS "public"."traslado" (
    "id_traslado" integer NOT NULL,
    "id_animal" integer NOT NULL,
    "id_espacio_origen" integer NOT NULL,
    "id_espacio_destino" integer NOT NULL,
    "fecha_traslado" timestamp without time zone DEFAULT "now"() NOT NULL,
    "motivo" character varying(255)
);


ALTER TABLE "public"."traslado" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."traslado_id_traslado_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."traslado_id_traslado_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."traslado_id_traslado_seq" OWNED BY "public"."traslado"."id_traslado";



CREATE TABLE IF NOT EXISTS "public"."usuario" (
    "id_usuario" integer NOT NULL,
    "id_refugio" integer,
    "nombre_completo" character varying(150) NOT NULL,
    "correo" character varying(150) NOT NULL,
    "activo" boolean DEFAULT true NOT NULL,
    "ultimo_login" timestamp without time zone,
    "fecha_creacion" timestamp without time zone DEFAULT "now"() NOT NULL,
    "rol" integer DEFAULT '1'::smallint NOT NULL,
    "auth_user_id" "uuid",
    "debe_cambiar_password" boolean DEFAULT false NOT NULL,
    "primer_inicio_sesion" boolean DEFAULT false NOT NULL,
    CONSTRAINT "chk_usuario_activo" CHECK (("activo" = ANY (ARRAY[true, false])))
);


ALTER TABLE "public"."usuario" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."usuario_id_usuario_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."usuario_id_usuario_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."usuario_id_usuario_seq" OWNED BY "public"."usuario"."id_usuario";



CREATE TABLE IF NOT EXISTS "public"."usuario_rol" (
    "id_usuario_rol" integer NOT NULL,
    "id_usuario" integer NOT NULL,
    "id_rol" integer NOT NULL
);


ALTER TABLE "public"."usuario_rol" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."usuario_rol_id_usuario_rol_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."usuario_rol_id_usuario_rol_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."usuario_rol_id_usuario_rol_seq" OWNED BY "public"."usuario_rol"."id_usuario_rol";



CREATE SEQUENCE IF NOT EXISTS "public"."vacunacion_id_vacunacion_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."vacunacion_id_vacunacion_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."vacunacion_id_vacunacion_seq" OWNED BY "public"."evento_sanitario"."id_evento";



ALTER TABLE ONLY "public"."adoptante" ALTER COLUMN "id_adoptante" SET DEFAULT "nextval"('"public"."adoptante_id_adoptante_seq"'::"regclass");



ALTER TABLE ONLY "public"."albergue_bloque" ALTER COLUMN "id_bloque" SET DEFAULT "nextval"('"public"."albergue_bloque_id_bloque_seq"'::"regclass");



ALTER TABLE ONLY "public"."albergue_perfil" ALTER COLUMN "id_perfil" SET DEFAULT "nextval"('"public"."albergue_perfil_id_perfil_seq"'::"regclass");



ALTER TABLE ONLY "public"."altas_cuarentena" ALTER COLUMN "id_alta" SET DEFAULT "nextval"('"public"."altas_cuarentena_id_alta_seq"'::"regclass");



ALTER TABLE ONLY "public"."animal" ALTER COLUMN "id_animal" SET DEFAULT "nextval"('"public"."animal_id_animal_seq"'::"regclass");



ALTER TABLE ONLY "public"."animal_estado" ALTER COLUMN "id_estado" SET DEFAULT "nextval"('"public"."animal_estado_id_estado_seq"'::"regclass");



ALTER TABLE ONLY "public"."auditoria" ALTER COLUMN "id_auditoria" SET DEFAULT "nextval"('"public"."auditoria_id_auditoria_seq"'::"regclass");



ALTER TABLE ONLY "public"."chequeos_medicos" ALTER COLUMN "id_chequeo" SET DEFAULT "nextval"('"public"."chequeos_medicos_id_chequeo_seq"'::"regclass");



ALTER TABLE ONLY "public"."cirugia_reproductiva" ALTER COLUMN "id_cirugia" SET DEFAULT "nextval"('"public"."cirugia_reproductiva_id_cirugia_seq"'::"regclass");



ALTER TABLE ONLY "public"."diagnostico_veterinario" ALTER COLUMN "id_diagnostico" SET DEFAULT "nextval"('"public"."diagnostico_veterinario_id_diagnostico_seq"'::"regclass");



ALTER TABLE ONLY "public"."donacion" ALTER COLUMN "id_donacion" SET DEFAULT "nextval"('"public"."donacion_id_donacion_seq"'::"regclass");



ALTER TABLE ONLY "public"."donante" ALTER COLUMN "id_donante" SET DEFAULT "nextval"('"public"."donante_id_donante_seq"'::"regclass");



ALTER TABLE ONLY "public"."espacio" ALTER COLUMN "id_espacio" SET DEFAULT "nextval"('"public"."espacio_id_espacio_seq"'::"regclass");



ALTER TABLE ONLY "public"."evaluacion_adopcion" ALTER COLUMN "id_evaluacion_adopcion" SET DEFAULT "nextval"('"public"."evaluacion_adopcion_id_evaluacion_adopcion_seq"'::"regclass");



ALTER TABLE ONLY "public"."evaluacion_temperamento" ALTER COLUMN "id_evaluacion_temperamento" SET DEFAULT "nextval"('"public"."evaluacion_temperamento_id_evaluacion_temperamento_seq"'::"regclass");



ALTER TABLE ONLY "public"."evento_sanitario" ALTER COLUMN "id_evento" SET DEFAULT "nextval"('"public"."vacunacion_id_vacunacion_seq"'::"regclass");



ALTER TABLE ONLY "public"."fotografia" ALTER COLUMN "id_fotografia" SET DEFAULT "nextval"('"public"."fotografia_id_fotografia_seq"'::"regclass");



ALTER TABLE ONLY "public"."historial_pago" ALTER COLUMN "id_pago" SET DEFAULT "nextval"('"public"."historial_pago_id_pago_seq"'::"regclass");



ALTER TABLE ONLY "public"."invitacion_admin" ALTER COLUMN "id_invitacion" SET DEFAULT "nextval"('"public"."invitacion_admin_id_invitacion_seq"'::"regclass");



ALTER TABLE ONLY "public"."permiso" ALTER COLUMN "id_permiso" SET DEFAULT "nextval"('"public"."permiso_id_permiso_seq"'::"regclass");



ALTER TABLE ONLY "public"."planes" ALTER COLUMN "id_plan" SET DEFAULT "nextval"('"public"."planes_id_plan_seq"'::"regclass");



ALTER TABLE ONLY "public"."refugio" ALTER COLUMN "id_refugio" SET DEFAULT "nextval"('"public"."refugio_id_refugio_seq"'::"regclass");



ALTER TABLE ONLY "public"."rol" ALTER COLUMN "id_rol" SET DEFAULT "nextval"('"public"."rol_id_rol_seq"'::"regclass");



ALTER TABLE ONLY "public"."rol_permiso" ALTER COLUMN "id_rol_permiso" SET DEFAULT "nextval"('"public"."rol_permiso_id_rol_permiso_seq"'::"regclass");



ALTER TABLE ONLY "public"."solicitud_adopcion" ALTER COLUMN "id_solicitud" SET DEFAULT "nextval"('"public"."solicitud_adopcion_id_solicitud_seq"'::"regclass");



ALTER TABLE ONLY "public"."super_admin" ALTER COLUMN "id_superadmin" SET DEFAULT "nextval"('"public"."super_admin_id_superadmin_seq"'::"regclass");



ALTER TABLE ONLY "public"."suscripcion" ALTER COLUMN "id_suscripcion" SET DEFAULT "nextval"('"public"."suscripcion_id_suscripcion_seq"'::"regclass");



ALTER TABLE ONLY "public"."traslado" ALTER COLUMN "id_traslado" SET DEFAULT "nextval"('"public"."traslado_id_traslado_seq"'::"regclass");



ALTER TABLE ONLY "public"."usuario" ALTER COLUMN "id_usuario" SET DEFAULT "nextval"('"public"."usuario_id_usuario_seq"'::"regclass");



ALTER TABLE ONLY "public"."usuario_rol" ALTER COLUMN "id_usuario_rol" SET DEFAULT "nextval"('"public"."usuario_rol_id_usuario_rol_seq"'::"regclass");



ALTER TABLE ONLY "public"."aceptacion_terminos"
    ADD CONSTRAINT "aceptacion_terminos_id_usuario_terminos_version_key" UNIQUE ("id_usuario", "terminos_version");



ALTER TABLE ONLY "public"."aceptacion_terminos"
    ADD CONSTRAINT "aceptacion_terminos_pkey" PRIMARY KEY ("id_aceptacion");



ALTER TABLE ONLY "public"."adoptante"
    ADD CONSTRAINT "adoptante_pkey" PRIMARY KEY ("id_adoptante");



ALTER TABLE ONLY "public"."albergue_bloque"
    ADD CONSTRAINT "albergue_bloque_pkey" PRIMARY KEY ("id_bloque");



ALTER TABLE ONLY "public"."albergue_perfil"
    ADD CONSTRAINT "albergue_perfil_pkey" PRIMARY KEY ("id_perfil");



ALTER TABLE ONLY "public"."altas_cuarentena"
    ADD CONSTRAINT "altas_cuarentena_pkey" PRIMARY KEY ("id_alta");



ALTER TABLE ONLY "public"."animal_estado"
    ADD CONSTRAINT "animal_estado_pkey" PRIMARY KEY ("id_estado");



ALTER TABLE ONLY "public"."animal"
    ADD CONSTRAINT "animal_pkey" PRIMARY KEY ("id_animal");



ALTER TABLE ONLY "public"."auditoria"
    ADD CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id_auditoria");



ALTER TABLE ONLY "public"."campana_animal"
    ADD CONSTRAINT "campana_animal_pkey" PRIMARY KEY ("id_campana", "id_animal");



ALTER TABLE ONLY "public"."campana"
    ADD CONSTRAINT "campana_pkey" PRIMARY KEY ("id_campana");



ALTER TABLE ONLY "public"."chequeo_sintomas"
    ADD CONSTRAINT "chequeo_sintomas_pkey" PRIMARY KEY ("id_chequeo", "sintoma");



ALTER TABLE ONLY "public"."chequeos_medicos"
    ADD CONSTRAINT "chequeos_medicos_pkey" PRIMARY KEY ("id_chequeo");



ALTER TABLE ONLY "public"."cirugia_reproductiva"
    ADD CONSTRAINT "cirugia_reproductiva_pkey" PRIMARY KEY ("id_cirugia");



ALTER TABLE "public"."diagnostico_veterinario"
    ADD CONSTRAINT "diagnostico_veterinario_estado_general_check" CHECK ((("estado_general")::"text" = ANY ((ARRAY['Crítico'::character varying, 'Delicado'::character varying, 'Estable'::character varying, 'Sano'::character varying])::"text"[]))) NOT VALID;



ALTER TABLE ONLY "public"."diagnostico_veterinario"
    ADD CONSTRAINT "diagnostico_veterinario_pkey" PRIMARY KEY ("id_diagnostico");



ALTER TABLE ONLY "public"."donacion"
    ADD CONSTRAINT "donacion_pkey" PRIMARY KEY ("id_donacion");



ALTER TABLE ONLY "public"."donante"
    ADD CONSTRAINT "donante_pkey" PRIMARY KEY ("id_donante");



ALTER TABLE ONLY "public"."espacio"
    ADD CONSTRAINT "espacio_pkey" PRIMARY KEY ("id_espacio");



ALTER TABLE ONLY "public"."evaluacion_adopcion"
    ADD CONSTRAINT "evaluacion_adopcion_pkey" PRIMARY KEY ("id_evaluacion_adopcion");



ALTER TABLE ONLY "public"."evaluacion_temperamento"
    ADD CONSTRAINT "evaluacion_temperamento_pkey" PRIMARY KEY ("id_evaluacion_temperamento");



ALTER TABLE ONLY "public"."fotografia"
    ADD CONSTRAINT "fotografia_pkey" PRIMARY KEY ("id_fotografia");



ALTER TABLE ONLY "public"."historial_pago"
    ADD CONSTRAINT "historial_pago_pkey" PRIMARY KEY ("id_pago");



ALTER TABLE ONLY "public"."invitacion_admin"
    ADD CONSTRAINT "invitacion_admin_pkey" PRIMARY KEY ("id_invitacion");



ALTER TABLE ONLY "public"."permiso"
    ADD CONSTRAINT "permiso_pkey" PRIMARY KEY ("id_permiso");



ALTER TABLE ONLY "public"."planes"
    ADD CONSTRAINT "planes_pkey" PRIMARY KEY ("id_plan");



ALTER TABLE ONLY "public"."refugio"
    ADD CONSTRAINT "refugio_pkey" PRIMARY KEY ("id_refugio");



ALTER TABLE ONLY "public"."rol_permiso"
    ADD CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("id_rol_permiso");



ALTER TABLE ONLY "public"."rol"
    ADD CONSTRAINT "rol_pkey" PRIMARY KEY ("id_rol");



ALTER TABLE ONLY "public"."solicitud_adopcion"
    ADD CONSTRAINT "solicitud_adopcion_pkey" PRIMARY KEY ("id_solicitud");



ALTER TABLE ONLY "public"."super_admin"
    ADD CONSTRAINT "super_admin_pkey" PRIMARY KEY ("id_superadmin");



ALTER TABLE ONLY "public"."suscripcion"
    ADD CONSTRAINT "suscripcion_pkey" PRIMARY KEY ("id_suscripcion");



ALTER TABLE ONLY "public"."traslado"
    ADD CONSTRAINT "traslado_pkey" PRIMARY KEY ("id_traslado");



ALTER TABLE ONLY "public"."animal_estado"
    ADD CONSTRAINT "uq_animal_estado_nombre" UNIQUE ("nombre_estado");



ALTER TABLE ONLY "public"."invitacion_admin"
    ADD CONSTRAINT "uq_invitacion_token" UNIQUE ("token");



ALTER TABLE ONLY "public"."albergue_perfil"
    ADD CONSTRAINT "uq_perfil_refugio" UNIQUE ("id_refugio");



ALTER TABLE ONLY "public"."albergue_perfil"
    ADD CONSTRAINT "uq_perfil_slug" UNIQUE ("slug");



ALTER TABLE ONLY "public"."permiso"
    ADD CONSTRAINT "uq_permiso_nombre" UNIQUE ("nombre_permiso");



ALTER TABLE ONLY "public"."refugio"
    ADD CONSTRAINT "uq_refugio_correo" UNIQUE ("correo_contacto");



ALTER TABLE ONLY "public"."rol"
    ADD CONSTRAINT "uq_rol_nombre" UNIQUE ("nombre_rol");



ALTER TABLE ONLY "public"."super_admin"
    ADD CONSTRAINT "uq_superadmin_auth_id" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."super_admin"
    ADD CONSTRAINT "uq_superadmin_correo" UNIQUE ("correo");



ALTER TABLE ONLY "public"."suscripcion"
    ADD CONSTRAINT "uq_suscripcion_refugio" UNIQUE ("id_refugio");



ALTER TABLE ONLY "public"."usuario"
    ADD CONSTRAINT "uq_usuario_correo" UNIQUE ("correo");



ALTER TABLE ONLY "public"."usuario"
    ADD CONSTRAINT "usuario_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."usuario"
    ADD CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario");



ALTER TABLE ONLY "public"."usuario_rol"
    ADD CONSTRAINT "usuario_rol_pkey" PRIMARY KEY ("id_usuario_rol");



ALTER TABLE ONLY "public"."evento_sanitario"
    ADD CONSTRAINT "vacunacion_pkey" PRIMARY KEY ("id_evento");



CREATE INDEX "aceptacion_terminos_usuario_idx" ON "public"."aceptacion_terminos" USING "btree" ("id_usuario");



CREATE INDEX "altas_cuarentena_refugio_animal_fecha_idx" ON "public"."altas_cuarentena" USING "btree" ("id_refugio", "id_animal", "fecha_alta" DESC);



CREATE UNIQUE INDEX "animal_microchip_unico" ON "public"."animal" USING "btree" ("microchip") WHERE (("microchip" IS NOT NULL) AND ("deleted_at" IS NULL));



CREATE INDEX "campana_animal_animal_idx" ON "public"."campana_animal" USING "btree" ("id_animal");



CREATE INDEX "campana_refugio_estado_idx" ON "public"."campana" USING "btree" ("id_refugio", "estado");



CREATE INDEX "chequeos_medicos_refugio_animal_fecha_idx" ON "public"."chequeos_medicos" USING "btree" ("id_refugio", "id_animal", "fecha_chequeo" DESC);



CREATE INDEX "evento_sanitario_refugio_animal_fecha_idx" ON "public"."evento_sanitario" USING "btree" ("id_refugio", "id_animal", "fecha_aplicacion" DESC);



CREATE INDEX "fotografia_animal_orden_idx" ON "public"."fotografia" USING "btree" ("id_animal", "orden");



CREATE UNIQUE INDEX "fotografia_principal_unica" ON "public"."fotografia" USING "btree" ("id_animal") WHERE "es_principal";



CREATE INDEX "idx_animal_disponible" ON "public"."animal" USING "btree" ("disponible_adopcion");



CREATE INDEX "idx_animal_espacio" ON "public"."animal" USING "btree" ("id_espacio");



CREATE INDEX "idx_animal_estado" ON "public"."animal" USING "btree" ("id_estado");



CREATE INDEX "idx_animal_refugio" ON "public"."animal" USING "btree" ("id_refugio");



CREATE INDEX "idx_auditoria_fecha" ON "public"."auditoria" USING "btree" ("fecha_evento");



CREATE INDEX "idx_auditoria_usuario" ON "public"."auditoria" USING "btree" ("id_usuario");



CREATE INDEX "idx_bloque_perfil_orden" ON "public"."albergue_bloque" USING "btree" ("id_perfil", "orden");



CREATE INDEX "idx_fotografia_animal" ON "public"."fotografia" USING "btree" ("id_animal");



CREATE INDEX "idx_invitacion_refugio" ON "public"."invitacion_admin" USING "btree" ("id_refugio");



CREATE INDEX "idx_perfil_slug" ON "public"."albergue_perfil" USING "btree" ("slug");



CREATE INDEX "idx_perfil_visible" ON "public"."albergue_perfil" USING "btree" ("visible_publico");



CREATE INDEX "idx_solicitud_adoptante" ON "public"."solicitud_adopcion" USING "btree" ("id_adoptante");



CREATE INDEX "idx_solicitud_animal" ON "public"."solicitud_adopcion" USING "btree" ("id_animal");



CREATE INDEX "idx_solicitud_estado" ON "public"."solicitud_adopcion" USING "btree" ("estado_solicitud");



CREATE INDEX "idx_suscripcion_refugio" ON "public"."suscripcion" USING "btree" ("id_refugio");



CREATE INDEX "idx_traslado_animal" ON "public"."traslado" USING "btree" ("id_animal");



CREATE INDEX "idx_usuario_refugio" ON "public"."usuario" USING "btree" ("id_refugio");



CREATE INDEX "idx_vacunacion_animal" ON "public"."evento_sanitario" USING "btree" ("id_animal");



CREATE OR REPLACE VIEW "public"."campana_publica" AS
 SELECT "c"."id_campana",
    "c"."titulo",
    "c"."contenido",
    "c"."hashtags",
    "c"."llamado_accion",
    "c"."fecha_publicacion",
    "r"."nombre" AS "refugio_nombre",
    "r"."ciudad" AS "refugio_ciudad",
    "r"."estado" AS "refugio_estado",
    "jsonb_agg"("jsonb_build_object"('id_animal', "a"."id_animal", 'nombre', "a"."nombre", 'especie', "a"."especie", 'raza', "a"."raza", 'sexo', "a"."sexo", 'edad_estimada', "a"."edad_estimada") ORDER BY "a"."id_animal") AS "animales"
   FROM ((("public"."campana" "c"
     JOIN "public"."refugio" "r" ON ((("r"."id_refugio" = "c"."id_refugio") AND "r"."activo")))
     JOIN "public"."campana_animal" "ca" ON (("ca"."id_campana" = "c"."id_campana")))
     JOIN "public"."animal" "a" ON ((("a"."id_animal" = "ca"."id_animal") AND "a"."disponible_adopcion" AND "a"."activo" AND ("a"."deleted_at" IS NULL))))
  WHERE ("c"."estado" = 'publicada'::"text")
  GROUP BY "c"."id_campana", "r"."id_refugio";



ALTER TABLE ONLY "public"."aceptacion_terminos"
    ADD CONSTRAINT "aceptacion_terminos_id_refugio_fkey" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."aceptacion_terminos"
    ADD CONSTRAINT "aceptacion_terminos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id_usuario") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."altas_cuarentena"
    ADD CONSTRAINT "altas_cuarentena_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "public"."animal"("id_animal") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."altas_cuarentena"
    ADD CONSTRAINT "altas_cuarentena_id_refugio_fkey" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."altas_cuarentena"
    ADD CONSTRAINT "altas_cuarentena_id_usuario_veterinario_fkey" FOREIGN KEY ("id_usuario_veterinario") REFERENCES "public"."usuario"("id_usuario");



ALTER TABLE ONLY "public"."campana_animal"
    ADD CONSTRAINT "campana_animal_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "public"."animal"("id_animal") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campana_animal"
    ADD CONSTRAINT "campana_animal_id_campana_fkey" FOREIGN KEY ("id_campana") REFERENCES "public"."campana"("id_campana") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campana"
    ADD CONSTRAINT "campana_id_refugio_fkey" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campana"
    ADD CONSTRAINT "campana_id_usuario_creador_fkey" FOREIGN KEY ("id_usuario_creador") REFERENCES "public"."usuario"("id_usuario") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."chequeo_sintomas"
    ADD CONSTRAINT "chequeo_sintomas_id_chequeo_fkey" FOREIGN KEY ("id_chequeo") REFERENCES "public"."chequeos_medicos"("id_chequeo") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chequeos_medicos"
    ADD CONSTRAINT "chequeos_medicos_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "public"."animal"("id_animal") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chequeos_medicos"
    ADD CONSTRAINT "chequeos_medicos_id_refugio_fkey" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chequeos_medicos"
    ADD CONSTRAINT "chequeos_medicos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id_usuario");



ALTER TABLE ONLY "public"."evento_sanitario"
    ADD CONSTRAINT "evento_sanitario_id_refugio_fkey" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio");



ALTER TABLE ONLY "public"."adoptante"
    ADD CONSTRAINT "fk_adoptante_refugio" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."animal"
    ADD CONSTRAINT "fk_animal_espacio" FOREIGN KEY ("id_espacio") REFERENCES "public"."espacio"("id_espacio") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."animal"
    ADD CONSTRAINT "fk_animal_estado" FOREIGN KEY ("id_estado") REFERENCES "public"."animal_estado"("id_estado") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."animal"
    ADD CONSTRAINT "fk_animal_refugio" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."auditoria"
    ADD CONSTRAINT "fk_auditoria_refugio" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."auditoria"
    ADD CONSTRAINT "fk_auditoria_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id_usuario") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."albergue_bloque"
    ADD CONSTRAINT "fk_bloque_perfil" FOREIGN KEY ("id_perfil") REFERENCES "public"."albergue_perfil"("id_perfil") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cirugia_reproductiva"
    ADD CONSTRAINT "fk_cirugia_animal" FOREIGN KEY ("id_animal") REFERENCES "public"."animal"("id_animal") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cirugia_reproductiva"
    ADD CONSTRAINT "fk_cirugia_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id_usuario") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."donacion"
    ADD CONSTRAINT "fk_donacion_donante" FOREIGN KEY ("id_donante") REFERENCES "public"."donante"("id_donante") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."donacion"
    ADD CONSTRAINT "fk_donacion_refugio" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."diagnostico_veterinario"
    ADD CONSTRAINT "fk_dx_animal" FOREIGN KEY ("id_animal") REFERENCES "public"."animal"("id_animal") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."diagnostico_veterinario"
    ADD CONSTRAINT "fk_dx_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id_usuario") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."espacio"
    ADD CONSTRAINT "fk_espacio_refugio" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."evaluacion_adopcion"
    ADD CONSTRAINT "fk_eval_solicitud" FOREIGN KEY ("id_solicitud") REFERENCES "public"."solicitud_adopcion"("id_solicitud") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluacion_adopcion"
    ADD CONSTRAINT "fk_eval_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id_usuario") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."fotografia"
    ADD CONSTRAINT "fk_foto_animal" FOREIGN KEY ("id_animal") REFERENCES "public"."animal"("id_animal") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitacion_admin"
    ADD CONSTRAINT "fk_invitacion_refugio" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."historial_pago"
    ADD CONSTRAINT "fk_pago_plan" FOREIGN KEY ("id_plan") REFERENCES "public"."planes"("id_plan") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."historial_pago"
    ADD CONSTRAINT "fk_pago_suscripcion" FOREIGN KEY ("id_suscripcion") REFERENCES "public"."suscripcion"("id_suscripcion") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."albergue_perfil"
    ADD CONSTRAINT "fk_perfil_refugio" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rol_permiso"
    ADD CONSTRAINT "fk_rolpermiso_permiso" FOREIGN KEY ("id_permiso") REFERENCES "public"."permiso"("id_permiso") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rol_permiso"
    ADD CONSTRAINT "fk_rolpermiso_rol" FOREIGN KEY ("id_rol") REFERENCES "public"."rol"("id_rol") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."solicitud_adopcion"
    ADD CONSTRAINT "fk_solicitud_adoptante" FOREIGN KEY ("id_adoptante") REFERENCES "public"."adoptante"("id_adoptante") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."solicitud_adopcion"
    ADD CONSTRAINT "fk_solicitud_animal" FOREIGN KEY ("id_animal") REFERENCES "public"."animal"("id_animal") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."suscripcion"
    ADD CONSTRAINT "fk_suscripcion_plan" FOREIGN KEY ("id_plan") REFERENCES "public"."planes"("id_plan") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."suscripcion"
    ADD CONSTRAINT "fk_suscripcion_refugio" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."evaluacion_temperamento"
    ADD CONSTRAINT "fk_temp_animal" FOREIGN KEY ("id_animal") REFERENCES "public"."animal"("id_animal") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluacion_temperamento"
    ADD CONSTRAINT "fk_temp_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id_usuario") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."traslado"
    ADD CONSTRAINT "fk_traslado_animal" FOREIGN KEY ("id_animal") REFERENCES "public"."animal"("id_animal") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."traslado"
    ADD CONSTRAINT "fk_traslado_destino" FOREIGN KEY ("id_espacio_destino") REFERENCES "public"."espacio"("id_espacio") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."traslado"
    ADD CONSTRAINT "fk_traslado_origen" FOREIGN KEY ("id_espacio_origen") REFERENCES "public"."espacio"("id_espacio") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."usuario"
    ADD CONSTRAINT "fk_usuario_refugio" FOREIGN KEY ("id_refugio") REFERENCES "public"."refugio"("id_refugio") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."usuario_rol"
    ADD CONSTRAINT "fk_usuariorol_rol" FOREIGN KEY ("id_rol") REFERENCES "public"."rol"("id_rol") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."usuario_rol"
    ADD CONSTRAINT "fk_usuariorol_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id_usuario") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evento_sanitario"
    ADD CONSTRAINT "fk_vacuna_animal" FOREIGN KEY ("id_animal") REFERENCES "public"."animal"("id_animal") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evento_sanitario"
    ADD CONSTRAINT "fk_vacuna_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id_usuario") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."usuario"
    ADD CONSTRAINT "usuario_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."usuario"
    ADD CONSTRAINT "usuario_rol_fkey" FOREIGN KEY ("rol") REFERENCES "public"."rol"("id_rol");



ALTER TABLE "public"."aceptacion_terminos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "aceptacion_terminos_propia" ON "public"."aceptacion_terminos" TO "authenticated" USING (("id_usuario" IN ( SELECT "u"."id_usuario"
   FROM "public"."usuario" "u"
  WHERE ("u"."auth_user_id" = "auth"."uid"())))) WITH CHECK (("id_usuario" IN ( SELECT "u"."id_usuario"
   FROM "public"."usuario" "u"
  WHERE ("u"."auth_user_id" = "auth"."uid"()))));



ALTER TABLE "public"."albergue_bloque" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."albergue_perfil" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."altas_cuarentena" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "altas_cuarentena_tenant_select" ON "public"."altas_cuarentena" FOR SELECT USING (true);



CREATE POLICY "altas_cuarentena_tenant_write" ON "public"."altas_cuarentena" USING (true) WITH CHECK (true);



ALTER TABLE "public"."campana" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campana_animal" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "campana_animal_personal" ON "public"."campana_animal" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."campana" "c"
  WHERE (("c"."id_campana" = "campana_animal"."id_campana") AND ("public"."campanas_es_superadmin"() OR ("c"."id_refugio" = "public"."campanas_refugio_usuario"())))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."campana" "c"
     JOIN "public"."animal" "a" ON (("a"."id_refugio" = "c"."id_refugio")))
  WHERE (("c"."id_campana" = "campana_animal"."id_campana") AND ("a"."id_animal" = "campana_animal"."id_animal") AND ("public"."campanas_es_superadmin"() OR ("c"."id_refugio" = "public"."campanas_refugio_usuario"()))))));



CREATE POLICY "campana_personal" ON "public"."campana" TO "authenticated" USING (("public"."campanas_es_superadmin"() OR ("id_refugio" = "public"."campanas_refugio_usuario"()))) WITH CHECK (("public"."campanas_es_superadmin"() OR ("id_refugio" = "public"."campanas_refugio_usuario"())));



ALTER TABLE "public"."chequeo_sintomas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "chequeo_sintomas_all" ON "public"."chequeo_sintomas" USING (true) WITH CHECK (true);



ALTER TABLE "public"."chequeos_medicos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "chequeos_medicos_tenant_select" ON "public"."chequeos_medicos" FOR SELECT USING (true);



CREATE POLICY "chequeos_medicos_tenant_write" ON "public"."chequeos_medicos" USING (true) WITH CHECK (true);



ALTER TABLE "public"."invitacion_admin" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."super_admin" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "public"."campanas_es_superadmin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."campanas_es_superadmin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."campanas_es_superadmin"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."campanas_refugio_usuario"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."campanas_refugio_usuario"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."campanas_refugio_usuario"() TO "service_role";



GRANT ALL ON TABLE "public"."aceptacion_terminos" TO "authenticated";
GRANT ALL ON TABLE "public"."aceptacion_terminos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."aceptacion_terminos_id_aceptacion_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."aceptacion_terminos_id_aceptacion_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."aceptacion_terminos_id_aceptacion_seq" TO "service_role";



GRANT ALL ON TABLE "public"."adoptante" TO "anon";
GRANT ALL ON TABLE "public"."adoptante" TO "authenticated";
GRANT ALL ON TABLE "public"."adoptante" TO "service_role";



GRANT ALL ON SEQUENCE "public"."adoptante_id_adoptante_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."adoptante_id_adoptante_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."adoptante_id_adoptante_seq" TO "service_role";



GRANT ALL ON TABLE "public"."albergue_bloque" TO "anon";
GRANT ALL ON TABLE "public"."albergue_bloque" TO "authenticated";
GRANT ALL ON TABLE "public"."albergue_bloque" TO "service_role";



GRANT ALL ON SEQUENCE "public"."albergue_bloque_id_bloque_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."albergue_bloque_id_bloque_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."albergue_bloque_id_bloque_seq" TO "service_role";



GRANT ALL ON TABLE "public"."albergue_perfil" TO "anon";
GRANT ALL ON TABLE "public"."albergue_perfil" TO "authenticated";
GRANT ALL ON TABLE "public"."albergue_perfil" TO "service_role";



GRANT ALL ON SEQUENCE "public"."albergue_perfil_id_perfil_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."albergue_perfil_id_perfil_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."albergue_perfil_id_perfil_seq" TO "service_role";



GRANT ALL ON TABLE "public"."altas_cuarentena" TO "anon";
GRANT ALL ON TABLE "public"."altas_cuarentena" TO "authenticated";
GRANT ALL ON TABLE "public"."altas_cuarentena" TO "service_role";



GRANT ALL ON SEQUENCE "public"."altas_cuarentena_id_alta_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."altas_cuarentena_id_alta_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."altas_cuarentena_id_alta_seq" TO "service_role";



GRANT ALL ON TABLE "public"."animal" TO "anon";
GRANT ALL ON TABLE "public"."animal" TO "authenticated";
GRANT ALL ON TABLE "public"."animal" TO "service_role";



GRANT ALL ON TABLE "public"."animal_estado" TO "anon";
GRANT ALL ON TABLE "public"."animal_estado" TO "authenticated";
GRANT ALL ON TABLE "public"."animal_estado" TO "service_role";



GRANT ALL ON SEQUENCE "public"."animal_estado_id_estado_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."animal_estado_id_estado_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."animal_estado_id_estado_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."animal_id_animal_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."animal_id_animal_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."animal_id_animal_seq" TO "service_role";



GRANT ALL ON TABLE "public"."auditoria" TO "anon";
GRANT ALL ON TABLE "public"."auditoria" TO "authenticated";
GRANT ALL ON TABLE "public"."auditoria" TO "service_role";



GRANT ALL ON SEQUENCE "public"."auditoria_id_auditoria_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."auditoria_id_auditoria_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."auditoria_id_auditoria_seq" TO "service_role";



GRANT ALL ON TABLE "public"."campana" TO "authenticated";
GRANT ALL ON TABLE "public"."campana" TO "service_role";



GRANT ALL ON TABLE "public"."campana_animal" TO "authenticated";
GRANT ALL ON TABLE "public"."campana_animal" TO "service_role";



GRANT ALL ON SEQUENCE "public"."campana_id_campana_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."campana_id_campana_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."campana_id_campana_seq" TO "service_role";



GRANT ALL ON TABLE "public"."campana_publica" TO "anon";
GRANT ALL ON TABLE "public"."campana_publica" TO "authenticated";
GRANT ALL ON TABLE "public"."campana_publica" TO "service_role";



GRANT ALL ON TABLE "public"."chequeo_sintomas" TO "anon";
GRANT ALL ON TABLE "public"."chequeo_sintomas" TO "authenticated";
GRANT ALL ON TABLE "public"."chequeo_sintomas" TO "service_role";



GRANT ALL ON TABLE "public"."chequeos_medicos" TO "anon";
GRANT ALL ON TABLE "public"."chequeos_medicos" TO "authenticated";
GRANT ALL ON TABLE "public"."chequeos_medicos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."chequeos_medicos_id_chequeo_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chequeos_medicos_id_chequeo_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."chequeos_medicos_id_chequeo_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cirugia_reproductiva" TO "anon";
GRANT ALL ON TABLE "public"."cirugia_reproductiva" TO "authenticated";
GRANT ALL ON TABLE "public"."cirugia_reproductiva" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cirugia_reproductiva_id_cirugia_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cirugia_reproductiva_id_cirugia_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cirugia_reproductiva_id_cirugia_seq" TO "service_role";



GRANT ALL ON TABLE "public"."diagnostico_veterinario" TO "anon";
GRANT ALL ON TABLE "public"."diagnostico_veterinario" TO "authenticated";
GRANT ALL ON TABLE "public"."diagnostico_veterinario" TO "service_role";



GRANT ALL ON SEQUENCE "public"."diagnostico_veterinario_id_diagnostico_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."diagnostico_veterinario_id_diagnostico_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."diagnostico_veterinario_id_diagnostico_seq" TO "service_role";



GRANT ALL ON TABLE "public"."donacion" TO "anon";
GRANT ALL ON TABLE "public"."donacion" TO "authenticated";
GRANT ALL ON TABLE "public"."donacion" TO "service_role";



GRANT ALL ON SEQUENCE "public"."donacion_id_donacion_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."donacion_id_donacion_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."donacion_id_donacion_seq" TO "service_role";



GRANT ALL ON TABLE "public"."donante" TO "anon";
GRANT ALL ON TABLE "public"."donante" TO "authenticated";
GRANT ALL ON TABLE "public"."donante" TO "service_role";



GRANT ALL ON SEQUENCE "public"."donante_id_donante_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."donante_id_donante_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."donante_id_donante_seq" TO "service_role";



GRANT ALL ON TABLE "public"."espacio" TO "anon";
GRANT ALL ON TABLE "public"."espacio" TO "authenticated";
GRANT ALL ON TABLE "public"."espacio" TO "service_role";



GRANT ALL ON SEQUENCE "public"."espacio_id_espacio_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."espacio_id_espacio_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."espacio_id_espacio_seq" TO "service_role";



GRANT ALL ON TABLE "public"."evaluacion_adopcion" TO "anon";
GRANT ALL ON TABLE "public"."evaluacion_adopcion" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluacion_adopcion" TO "service_role";



GRANT ALL ON SEQUENCE "public"."evaluacion_adopcion_id_evaluacion_adopcion_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."evaluacion_adopcion_id_evaluacion_adopcion_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."evaluacion_adopcion_id_evaluacion_adopcion_seq" TO "service_role";



GRANT ALL ON TABLE "public"."evaluacion_temperamento" TO "anon";
GRANT ALL ON TABLE "public"."evaluacion_temperamento" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluacion_temperamento" TO "service_role";



GRANT ALL ON SEQUENCE "public"."evaluacion_temperamento_id_evaluacion_temperamento_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."evaluacion_temperamento_id_evaluacion_temperamento_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."evaluacion_temperamento_id_evaluacion_temperamento_seq" TO "service_role";



GRANT ALL ON TABLE "public"."evento_sanitario" TO "anon";
GRANT ALL ON TABLE "public"."evento_sanitario" TO "authenticated";
GRANT ALL ON TABLE "public"."evento_sanitario" TO "service_role";



GRANT ALL ON TABLE "public"."fotografia" TO "anon";
GRANT ALL ON TABLE "public"."fotografia" TO "authenticated";
GRANT ALL ON TABLE "public"."fotografia" TO "service_role";



GRANT ALL ON SEQUENCE "public"."fotografia_id_fotografia_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."fotografia_id_fotografia_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."fotografia_id_fotografia_seq" TO "service_role";



GRANT ALL ON TABLE "public"."historial_pago" TO "anon";
GRANT ALL ON TABLE "public"."historial_pago" TO "authenticated";
GRANT ALL ON TABLE "public"."historial_pago" TO "service_role";



GRANT ALL ON SEQUENCE "public"."historial_pago_id_pago_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."historial_pago_id_pago_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."historial_pago_id_pago_seq" TO "service_role";



GRANT ALL ON TABLE "public"."invitacion_admin" TO "anon";
GRANT ALL ON TABLE "public"."invitacion_admin" TO "authenticated";
GRANT ALL ON TABLE "public"."invitacion_admin" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invitacion_admin_id_invitacion_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invitacion_admin_id_invitacion_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invitacion_admin_id_invitacion_seq" TO "service_role";



GRANT ALL ON TABLE "public"."permiso" TO "anon";
GRANT ALL ON TABLE "public"."permiso" TO "authenticated";
GRANT ALL ON TABLE "public"."permiso" TO "service_role";



GRANT ALL ON SEQUENCE "public"."permiso_id_permiso_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."permiso_id_permiso_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."permiso_id_permiso_seq" TO "service_role";



GRANT ALL ON TABLE "public"."planes" TO "anon";
GRANT ALL ON TABLE "public"."planes" TO "authenticated";
GRANT ALL ON TABLE "public"."planes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."planes_id_plan_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."planes_id_plan_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."planes_id_plan_seq" TO "service_role";



GRANT ALL ON TABLE "public"."refugio" TO "anon";
GRANT ALL ON TABLE "public"."refugio" TO "authenticated";
GRANT ALL ON TABLE "public"."refugio" TO "service_role";



GRANT ALL ON SEQUENCE "public"."refugio_id_refugio_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."refugio_id_refugio_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."refugio_id_refugio_seq" TO "service_role";



GRANT ALL ON TABLE "public"."rol" TO "anon";
GRANT ALL ON TABLE "public"."rol" TO "authenticated";
GRANT ALL ON TABLE "public"."rol" TO "service_role";



GRANT ALL ON SEQUENCE "public"."rol_id_rol_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rol_id_rol_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rol_id_rol_seq" TO "service_role";



GRANT ALL ON TABLE "public"."rol_permiso" TO "anon";
GRANT ALL ON TABLE "public"."rol_permiso" TO "authenticated";
GRANT ALL ON TABLE "public"."rol_permiso" TO "service_role";



GRANT ALL ON SEQUENCE "public"."rol_permiso_id_rol_permiso_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rol_permiso_id_rol_permiso_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rol_permiso_id_rol_permiso_seq" TO "service_role";



GRANT ALL ON TABLE "public"."solicitud_adopcion" TO "anon";
GRANT ALL ON TABLE "public"."solicitud_adopcion" TO "authenticated";
GRANT ALL ON TABLE "public"."solicitud_adopcion" TO "service_role";



GRANT ALL ON SEQUENCE "public"."solicitud_adopcion_id_solicitud_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."solicitud_adopcion_id_solicitud_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."solicitud_adopcion_id_solicitud_seq" TO "service_role";



GRANT ALL ON TABLE "public"."super_admin" TO "anon";
GRANT ALL ON TABLE "public"."super_admin" TO "authenticated";
GRANT ALL ON TABLE "public"."super_admin" TO "service_role";



GRANT ALL ON SEQUENCE "public"."super_admin_id_superadmin_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."super_admin_id_superadmin_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."super_admin_id_superadmin_seq" TO "service_role";



GRANT ALL ON TABLE "public"."suscripcion" TO "anon";
GRANT ALL ON TABLE "public"."suscripcion" TO "authenticated";
GRANT ALL ON TABLE "public"."suscripcion" TO "service_role";



GRANT ALL ON SEQUENCE "public"."suscripcion_id_suscripcion_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."suscripcion_id_suscripcion_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."suscripcion_id_suscripcion_seq" TO "service_role";



GRANT ALL ON TABLE "public"."traslado" TO "anon";
GRANT ALL ON TABLE "public"."traslado" TO "authenticated";
GRANT ALL ON TABLE "public"."traslado" TO "service_role";



GRANT ALL ON SEQUENCE "public"."traslado_id_traslado_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."traslado_id_traslado_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."traslado_id_traslado_seq" TO "service_role";



GRANT ALL ON TABLE "public"."usuario" TO "anon";
GRANT ALL ON TABLE "public"."usuario" TO "authenticated";
GRANT ALL ON TABLE "public"."usuario" TO "service_role";



GRANT ALL ON SEQUENCE "public"."usuario_id_usuario_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."usuario_id_usuario_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."usuario_id_usuario_seq" TO "service_role";



GRANT ALL ON TABLE "public"."usuario_rol" TO "anon";
GRANT ALL ON TABLE "public"."usuario_rol" TO "authenticated";
GRANT ALL ON TABLE "public"."usuario_rol" TO "service_role";



GRANT ALL ON SEQUENCE "public"."usuario_rol_id_usuario_rol_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."usuario_rol_id_usuario_rol_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."usuario_rol_id_usuario_rol_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."vacunacion_id_vacunacion_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."vacunacion_id_vacunacion_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."vacunacion_id_vacunacion_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";








commit;
