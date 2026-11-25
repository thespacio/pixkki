-- Datos de demostración: refugios, personal y animales.
--
-- Idempotente: se ejecuta con `supabase db reset` (config.toml apunta a este
-- archivo). No actualiza ni elimina filas existentes; si la clave natural ya
-- está ocupada por un registro no demo, la migración anterior o el script de
-- producción correspondiente debe abortar.

begin;

insert into public.animal_estado (nombre_estado, descripcion)
select 'Cuarentena', 'Estado de aislamiento obligatorio al ingreso'
where not exists (
    select 1 from public.animal_estado where nombre_estado = 'Cuarentena'
);

with refugios_demo (slug, nombre, ciudad, estado, correo_contacto, telefono, descripcion_publica) as (
    values
        (
            'demo-refugio-norte',
            'DEMO Refugio Norte',
            'Monterrey',
            'Nuevo León',
            'demo.norte@pixkki.test',
            '+52 81 0000 0001',
            'Refugio ficticio para pruebas de demostración.'
        ),
        (
            'demo-refugio-sur',
            'DEMO Refugio Sur',
            'Guadalajara',
            'Jalisco',
            'demo.sur@pixkki.test',
            '+52 33 0000 0002',
            'Refugio ficticio para pruebas de demostración.'
        )
),
inserted_refugios as (
    insert into public.refugio (
        slug, nombre, ciudad, estado, correo_contacto, telefono,
        descripcion_publica, activo
    )
    select slug, nombre, ciudad, estado, correo_contacto, telefono, descripcion_publica, true
    from refugios_demo
    where not exists (
        select 1 from public.refugio r where r.slug = refugios_demo.slug
    )
    on conflict (slug) do nothing
    returning id_refugio, slug
),
refugios_resueltos as (
    select id_refugio, slug from inserted_refugios
    union all
    select r.id_refugio, r.slug
    from public.refugio r
    join refugios_demo d on d.slug = r.slug
    where not exists (
        select 1 from inserted_refugios i where i.slug = r.slug
    )
),
espacios_demo as (
    select
        r.id_refugio,
        case when r.slug = 'demo-refugio-norte' then 'DEMO Canil Norte' else 'DEMO Gatera Sur' end as nombre_espacio,
        case when r.slug = 'demo-refugio-norte' then 'canil' else 'gatera' end as tipo,
        20 as capacidad,
        'Espacio ficticio para datos de prueba' as descripcion
    from refugios_resueltos r
),
inserted_espacios as (
    insert into public.espacio (id_refugio, nombre_espacio, tipo, capacidad, disponible, descripcion)
    select e.id_refugio, e.nombre_espacio, e.tipo, e.capacidad, true, e.descripcion
    from espacios_demo e
    where not exists (
        select 1 from public.espacio s
        where s.id_refugio = e.id_refugio and s.nombre_espacio = e.nombre_espacio
    )
    returning id_espacio, id_refugio, nombre_espacio
),
espacios_resueltos as (
    select id_espacio, id_refugio, nombre_espacio from inserted_espacios
    union all
    select s.id_espacio, s.id_refugio, s.nombre_espacio
    from public.espacio s
    join espacios_demo e
        on e.id_refugio = s.id_refugio and e.nombre_espacio = s.nombre_espacio
    where not exists (
        select 1 from inserted_espacios i where i.id_refugio = s.id_refugio
    )
),
roles_demo (correo, nombre_completo, rol, slug_refugio) as (
    values
        ('demo.superadmin@pixkki.test', 'DEMO Superadmin', 3, null::text),
        ('demo.admin.norte@pixkki.test', 'DEMO Admin Norte', 1, 'demo-refugio-norte'),
        ('demo.vet.norte@pixkki.test', 'DEMO Vet Norte', 2, 'demo-refugio-norte'),
        ('demo.admin.sur@pixkki.test', 'DEMO Admin Sur', 1, 'demo-refugio-sur'),
        ('demo.vet.sur@pixkki.test', 'DEMO Vet Sur', 2, 'demo-refugio-sur')
),
usuarios_a_insertar as (
    select d.correo, d.nombre_completo, d.rol, r.id_refugio
    from roles_demo d
    left join refugios_resueltos r on r.slug = d.slug_refugio
    where d.slug_refugio is null or r.id_refugio is not null
),
inserted_usuarios as (
    insert into public.usuario (
        nombre_completo, correo, rol, id_refugio, activo,
        debe_cambiar_password, primer_inicio_sesion
    )
    select u.nombre_completo, u.correo, u.rol, u.id_refugio, true, true, true
    from usuarios_a_insertar u
    where not exists (
        select 1 from public.usuario us where us.correo = u.correo
    )
    on conflict (correo) do nothing
    returning id_usuario, correo
),
estado_resuelto as (
    select id_estado
    from public.animal_estado
    where nombre_estado = 'Cuarentena'
    order by id_estado
    limit 1
),
animales_demo (
    slug_refugio, nombre, especie, raza, sexo, edad_estimada,
    procedencia, rasgos_fisicos, estado_inicial, peso, tamano, color, temperamento
) as (
    values
        ('demo-refugio-norte', 'DEMO Luna', 'Perro', 'Mestizo', 'H', 2, 'Rescate', 'Pelaje corto color crema', 'Rescate', 12.50, 'Mediano', 'Crema', 'Tranquilo'),
        ('demo-refugio-norte', 'DEMO Bruno', 'Perro', 'Labrador', 'M', 4, 'Rescate', 'Pelaje dorado y porte robusto', 'Rescate', 24.00, 'Grande', 'Dorado', 'Juguetón'),
        ('demo-refugio-norte', 'DEMO Canela', 'Gato', 'Mestizo', 'H', 1, 'Rescate', 'Pelaje corto atigrado', 'Rescate', 3.80, 'Pequeño', 'Atigrado', 'Dulce'),
        ('demo-refugio-norte', 'DEMO Pipo', 'Perro', 'Chihuahua', 'M', 3, 'Rescate', 'Pelaje corto color café', 'Rescate', 4.20, 'Pequeño', 'Café', 'Activo'),
        ('demo-refugio-norte', 'DEMO Nieve', 'Gato', 'Mestizo', 'H', 2, 'Rescate', 'Pelaje blanco y ojos azules', 'Rescate', 4.10, 'Pequeño', 'Blanco', 'Curioso'),
        ('demo-refugio-sur', 'DEMO Coco', 'Perro', 'Mestizo', 'H', 3, 'Rescate', 'Pelaje corto color canela', 'Rescate', 15.00, 'Mediano', 'Canela', 'Sociable'),
        ('demo-refugio-sur', 'DEMO Mocha', 'Gato', 'Mestizo', 'M', 2, 'Rescate', 'Pelaje corto color gris', 'Rescate', 4.50, 'Pequeño', 'Gris', 'Tranquilo'),
        ('demo-refugio-sur', 'DEMO Rey', 'Perro', 'Pastor', 'M', 5, 'Rescate', 'Pelaje doble color negro y canela', 'Rescate', 28.00, 'Grande', 'Negro', 'Protector'),
        ('demo-refugio-sur', 'DEMO Mimi', 'Gato', 'Mestizo', 'H', 1, 'Rescate', 'Pelaje corto tricolor', 'Rescate', 3.50, 'Pequeño', 'Tricolor', 'Dulce'),
        ('demo-refugio-sur', 'DEMO Tango', 'Perro', 'Mestizo', 'M', 4, 'Rescate', 'Pelaje corto color negro', 'Rescate', 18.00, 'Mediano', 'Negro', 'Enérgico')
),
animales_a_insertar as (
    select a.*, r.id_refugio, e.id_espacio, er.id_estado
    from animales_demo a
    join refugios_resueltos r on r.slug = a.slug_refugio
    join espacios_resueltos e on e.id_refugio = r.id_refugio
    cross join estado_resuelto er
),
inserted_animales as (
    insert into public.animal (
        id_refugio, id_estado, id_espacio, nombre, especie, raza, sexo,
        edad_estimada, procedencia, rasgos_fisicos, estado_inicial,
        en_cuarentena, esterilizado, disponible_adopcion, activo,
        vacunado, desparasitado, peso, tamano, color, temperamento
    )
    select
        a.id_refugio, a.id_estado, a.id_espacio, a.nombre, a.especie, a.raza,
        a.sexo, a.edad_estimada, a.procedencia, a.rasgos_fisicos, a.estado_inicial,
        true, false, false, true, true, true,
        a.peso, a.tamano, a.color, a.temperamento
    from animales_a_insertar a
    where not exists (
        select 1 from public.animal an
        where an.id_refugio = a.id_refugio and an.nombre = a.nombre
    )
    returning id_animal
)
select
    (select count(*) from inserted_refugios) as refugios_creados,
    (select count(*) from inserted_espacios) as espacios_creados,
    (select count(*) from inserted_usuarios) as usuarios_creados,
    (select count(*) from inserted_animales) as animales_creados;

commit;
