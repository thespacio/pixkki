export interface AnimalFormData {
    nombre: string;
    especie: 'Perro' | 'Gato';
    raza: string;
    sexo: "M" | "H" | "";
    edadEstimada: string;
    peso: string;
    procedencia: string;
    rasgosFisicos: string;
    estadoInicial: string;
    idEstado: string;
    idEspacio: string;
    enCuarentena: boolean;
    esterilizado: boolean;
    disponibleParaAdopcion: boolean;
}