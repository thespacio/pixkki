"use client"
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

export default function PrivacidadPage() {
    const router = useRouter();
    const goBack = ()=> {
        router.back(); //
    }
  return (
    <div className="container mx-auto max-w-3xl py-10 px-4" >
      <div>
          <h1 >TÉRMINOS Y CONDICIONES DE USO DE LA PLATAFORMA PIXKKI</h1>
          <ol>
              <li dir="auto"><strong>IDENTIFICACIÓN DEL TITULAR</strong></li>
          </ol>
          <p dir="auto">La plataforma Pixkki es operada y administrada por Tecnología y Bienestar Digital Pixxki, S.A.
              de C.V., sociedad constituida conforme a las leyes de los Estados Unidos Mexicanos (en adelante, “Pixkki”,
              “la Plataforma” o “el Prestador”).</p>
          <p dir="auto">Para cualquier consulta relacionada con estos Términos y Condiciones, los usuarios podrán
              comunicarse a través de los medios de contacto que la empresa publique oficialmente.</p>
          <p dir="auto">Correo de soporte: &nbsp;</p>
          <p dir="auto">[<a data-tooltip-position="top" aria-label="mailto:soporte@pixkki.com" rel="noopener nofollow"
                            className="external-link" href="mailto:soporte@pixkki.com"
                            target="_blank">soporte@pixkki.com</a>]</p>
          <p dir="auto">Correo de privacidad: &nbsp;</p>
          <p dir="auto">[<a data-tooltip-position="top" aria-label="mailto:privacidad@pixkki.com"
                            rel="noopener nofollow" className="external-link" href="mailto:privacidad@pixkki.com"
                            target="_blank">privacidad@pixkki.com</a>]</p>
          <ol>
              <li dir="auto"><strong>ACEPTACIÓN DE LOS TÉRMINOS</strong></li>
          </ol>
          <p dir="auto">Al registrarse, acceder o utilizar la Plataforma, el usuario declara haber leído, comprendido y
              aceptado íntegramente estos Términos y Condiciones.</p>
          <p dir="auto">La aceptación se realiza mediante mecanismos electrónicos válidos, incluyendo la selección de
              casillas de aceptación durante el proceso de registro o creación de cuentas.</p>
          <p dir="auto">Pixkki conservará evidencia electrónica de dicha aceptación, incluyendo fecha, hora y versión
              vigente del documento aceptado.</p>
          <ol>
              <li dir="auto"><strong>OBJETO DE LA PLATAFORMA</strong></li>
          </ol>
          <p dir="auto">Pixkki es una plataforma tecnológica diseñada para apoyar la gestión operativa de refugios,
              albergues, asociaciones civiles y organizaciones dedicadas al rescate, cuidado y adopción de animales.</p>
          <p dir="auto">La Plataforma permite, entre otras funciones:</p>
          <ul>
              <li dir="auto">
                  <p>Gestión de expedientes de animales.</p>
              </li>
              <li dir="auto">
                  <p>Administración de usuarios y roles.</p>
              </li>
              <li dir="auto">
                  <p>Registro clínico y sanitario.</p>
              </li>
              <li dir="auto">
                  <p>Gestión de adopciones.</p>
              </li>
              <li dir="auto">
                  <p>Control de inventarios y donaciones en especie.</p>
              </li>
              <li dir="auto">
                  <p>Generación de reportes.</p>
              </li>
              <li dir="auto">
                  <p>Publicación de perfiles públicos para adopción.</p>
              </li>
              <li dir="auto">
                  <p>Herramientas asistidas por inteligencia artificial.</p>
              </li>
          </ul>
          <p dir="auto">Pixkki no presta servicios veterinarios, médicos, legales ni de adopción.</p>
          <ol>
              <li dir="auto"><strong>REQUISITOS DE USO</strong></li>
          </ol>
          <p dir="auto">Para utilizar la Plataforma se requiere:</p>
          <p dir="auto">a) Ser mayor de 18 años. &nbsp;</p>
          <p dir="auto">b) Tener capacidad legal para celebrar contratos. &nbsp;</p>
          <p dir="auto">c) Proporcionar información veraz y actualizada. &nbsp;</p>
          <p dir="auto">d) Cumplir la legislación aplicable.</p>
          <p dir="auto">Los usuarios registrados por un refugio deberán estar autorizados por dicha organización para
              acceder y utilizar la Plataforma.</p>
          <ol>
              <li dir="auto"><strong>CUENTAS Y ACCESO</strong></li>
          </ol>
          <p dir="auto">Cada usuario será responsable de mantener la confidencialidad de sus credenciales de acceso.</p>
          <p dir="auto">El usuario se compromete a:</p>
          <ul>
              <li dir="auto">
                  <p>No compartir contraseñas.</p>
              </li>
              <li dir="auto">
                  <p>No permitir accesos no autorizados.</p>
              </li>
              <li dir="auto">
                  <p>Notificar inmediatamente cualquier uso sospechoso de su cuenta.</p>
              </li>
          </ul>
          <p dir="auto">Pixkki no será responsable por daños derivados del uso indebido de credenciales por parte del
              usuario o terceros.</p>
          <ol>
              <li dir="auto"><strong>RESPONSABILIDADES DE LOS REFUGIOS</strong></li>
          </ol>
          <p dir="auto">Cada refugio es el único responsable de:</p>
          <ul>
              <li dir="auto">
                  <p>La información cargada en la Plataforma.</p>
              </li>
              <li dir="auto">
                  <p>La veracidad de expedientes clínicos.</p>
              </li>
              <li dir="auto">
                  <p>Las fotografías publicadas.</p>
              </li>
              <li dir="auto">
                  <p>Las evaluaciones veterinarias.</p>
              </li>
              <li dir="auto">
                  <p>Las decisiones de adopción.</p>
              </li>
              <li dir="auto">
                  <p>La gestión de sus usuarios internos.</p>
              </li>
          </ul>
          <p dir="auto">Pixkki actúa exclusivamente como proveedor de herramientas tecnológicas para la gestión de
              información.</p>
          <ol>
              <li dir="auto"><strong>ADOPCIONES</strong></li>
          </ol>
          <p dir="auto">Pixkki no participa en procesos de evaluación, aprobación, seguimiento ni formalización de
              adopciones.</p>
          <p dir="auto">Toda decisión relacionada con la adopción de un animal corresponde exclusivamente al refugio
              responsable.</p>
          <p dir="auto">Pixkki no garantiza la idoneidad de adoptantes, animales o procesos de adopción realizados por
              terceros.</p>
          <ol>
              <li dir="auto"><strong>INFORMACIÓN VETERINARIA</strong></li>
          </ol>
          <p dir="auto">La información médica, clínica y sanitaria registrada dentro de la Plataforma es responsabilidad
              exclusiva de los profesionales veterinarios y del refugio correspondiente.</p>
          <p dir="auto">Pixkki no emite diagnósticos, recomendaciones médicas ni servicios de atención veterinaria.</p>
          <p dir="auto">Los registros almacenados tienen fines administrativos y de gestión documental.</p>
          <ol>
              <li dir="auto"><strong>CONTENIDO Y FOTOGRAFÍAS</strong></li>
          </ol>
          <p dir="auto">Los refugios conservan todos los derechos sobre las fotografías, textos e información que
              carguen en la Plataforma.</p>
          <p dir="auto">Al publicar contenido, el refugio concede a Pixkki una licencia no exclusiva, gratuita y
              revocable para utilizar dicho material con fines de:</p>
          <ul>
              <li dir="auto">
                  <p>Promoción de la Plataforma.</p>
              </li>
              <li dir="auto">
                  <p>Material informativo.</p>
              </li>
              <li dir="auto">
                  <p>Casos de éxito.</p>
              </li>
              <li dir="auto">
                  <p>Redes sociales.</p>
              </li>
              <li dir="auto">
                  <p>Demostraciones comerciales.</p>
              </li>
          </ul>
          <p dir="auto">Pixkki no comercializará las fotografías de manera independiente ni reclamará derechos de
              propiedad sobre ellas.</p>
          <ol>
              <li dir="auto"><strong>USO DE INTELIGENCIA ARTIFICIAL</strong></li>
          </ol>
          <p dir="auto">La Plataforma podrá incorporar herramientas de inteligencia artificial para asistir en la
              generación de perfiles de adopción u otras funciones.</p>
          <p dir="auto">El contenido generado mediante IA:</p>
          <ul>
              <li dir="auto">
                  <p>Tiene carácter informativo.</p>
              </li>
              <li dir="auto">
                  <p>Puede contener errores o imprecisiones.</p>
              </li>
              <li dir="auto">
                  <p>No sustituye la evaluación profesional humana.</p>
              </li>
          </ul>
          <p dir="auto">Los usuarios reconocen que no deben tomar decisiones exclusivamente con base en resultados
              generados por inteligencia artificial.</p>
          <p dir="auto">Pixkki podrá modificar, sustituir o actualizar los proveedores tecnológicos de IA utilizados por
              la Plataforma sin necesidad de consentimiento individual adicional.</p>
          <ol>
              <li dir="auto"><strong>DISPONIBILIDAD DEL SERVICIO</strong></li>
          </ol>
          <p dir="auto">La Plataforma se proporciona &#34;tal cual&#34; y &#34;según disponibilidad&#34;.</p>
          <p dir="auto">Pixkki no garantiza:</p>
          <ul>
              <li dir="auto">
                  <p>Disponibilidad ininterrumpida.</p>
              </li>
              <li dir="auto">
                  <p>Ausencia total de errores.</p>
              </li>
              <li dir="auto">
                  <p>Compatibilidad absoluta con todos los dispositivos.</p>
              </li>
              <li dir="auto">
                  <p>Operación libre de interrupciones ocasionadas por terceros.</p>
              </li>
          </ul>
          <ol>
              <li dir="auto"><strong>SEGURIDAD INFORMÁTICA</strong></li>
          </ol>
          <p dir="auto">Pixkki implementará medidas razonables de seguridad para proteger la información almacenada.</p>
          <p dir="auto">Sin embargo, ningún sistema tecnológico puede garantizar seguridad absoluta.</p>
          <p dir="auto">Pixkki no será responsable por daños derivados de:</p>
          <ul>
              <li dir="auto">Ataques informáticos.</li>
          </ul>
          <p dir="auto">&nbsp; * Malware.</p>
          <p dir="auto">&nbsp; * Vulnerabilidades de terceros.</p>
          <p dir="auto">&nbsp; * Interrupciones de proveedores de infraestructura.</p>
          <p dir="auto">&nbsp; * Fallas de telecomunicaciones.</p>
          <ol>
              <li dir="auto"><strong>PROPIEDAD INTELECTUAL</strong></li>
          </ol>
          <p dir="auto">Todos los derechos sobre la Plataforma, incluyendo:</p>
          <ul>
              <li dir="auto">
                  <p>Código fuente.</p>
              </li>
              <li dir="auto">
                  <p>Diseño.</p>
              </li>
              <li dir="auto">
                  <p>Interfaces.</p>
              </li>
              <li dir="auto">
                  <p>Bases de datos estructurales.</p>
              </li>
              <li dir="auto">
                  <p>Logotipos.</p>
              </li>
              <li dir="auto">
                  <p>Marcas.</p>
              </li>
              <li dir="auto">
                  <p>Funcionalidades.</p>
              </li>
          </ul>
          <p dir="auto">pertenecen exclusivamente a Tecnología y Bienestar Digital Pixxki, S.A. de C.V.</p>
          <p dir="auto">Queda prohibida la reproducción, copia, ingeniería inversa o explotación no autorizada de la
              Plataforma.</p>
          <ol>
              <li dir="auto"><strong>USOS PROHIBIDOS</strong></li>
          </ol>
          <p dir="auto">Se prohíbe:</p>
          <ul>
              <li dir="auto">
                  <p>Publicar información falsa.</p>
              </li>
              <li dir="auto">
                  <p>Suplantar identidades.</p>
              </li>
              <li dir="auto">
                  <p>Compartir accesos.</p>
              </li>
              <li dir="auto">
                  <p>Vulnerar sistemas de seguridad.</p>
              </li>
              <li dir="auto">
                  <p>Infringir derechos de autor.</p>
              </li>
              <li dir="auto">
                  <p>Utilizar la Plataforma para actividades ilícitas.</p>
              </li>
              <li dir="auto">
                  <p>Intentar acceder a información de otros refugios.</p>
              </li>
          </ul>
          <ol>
              <li dir="auto"><strong>SUSPENSIÓN Y CANCELACIÓN</strong></li>
          </ol>
          <p dir="auto">Pixkki podrá suspender o cancelar cuentas cuando detecte:</p>
          <ul>
              <li dir="auto">
                  <p>Uso ilegal.</p>
              </li>
              <li dir="auto">
                  <p>Violaciones a estos términos.</p>
              </li>
              <li dir="auto">
                  <p>Intentos de acceso no autorizado.</p>
              </li>
              <li dir="auto">
                  <p>Infracción de derechos de propiedad intelectual.</p>
              </li>
              <li dir="auto">
                  <p>Uso abusivo o fraudulento de la Plataforma.</p>
              </li>
              <li dir="auto">
                  <p>Publicación reiterada de información falsa.</p>
              </li>
          </ul>
          <ol>
              <li dir="auto"><strong>EXPORTACIÓN Y ELIMINACIÓN DE DATOS</strong></li>
          </ol>
          <p dir="auto">Los refugios conservarán la propiedad de la información que registren.</p>
          <p dir="auto">Antes de solicitar la baja definitiva de su cuenta, podrán solicitar una exportación de sus
              datos.</p>
          <p dir="auto">Una vez concluido el proceso de baja:</p>
          <ul>
              <li dir="auto">
                  <p>La información permanecerá almacenada durante un máximo de 30 días.</p>
              </li>
              <li dir="auto">
                  <p>Finalizado dicho plazo, la información será eliminada de forma permanente, salvo obligación legal
                      en contrario.</p>
              </li>
          </ul>
          <ol>
              <li dir="auto"><strong>LIMITACIÓN DE RESPONSABILIDAD</strong></li>
          </ol>
          <p dir="auto">En ningún caso Pixkki será responsable por:</p>
          <ul>
              <li dir="auto">
                  <p>Decisiones de adopción.</p>
              </li>
              <li dir="auto">
                  <p>Diagnósticos veterinarios.</p>
              </li>
              <li dir="auto">
                  <p>Contenido generado por usuarios.</p>
              </li>
              <li dir="auto">
                  <p>Información falsa cargada por refugios.</p>
              </li>
              <li dir="auto">
                  <p>Pérdidas derivadas de terceros.</p>
              </li>
              <li dir="auto">
                  <p>Ataques informáticos externos.</p>
              </li>
              <li dir="auto">
                  <p>Infracciones de derechos de autor cometidas por usuarios.</p>
              </li>
          </ul>
          <ol>
              <li dir="auto"><strong>MODIFICACIONES</strong></li>
          </ol>
          <p dir="auto">Pixkki podrá modificar estos Términos y Condiciones cuando resulte necesario.</p>
          <p dir="auto">Las modificaciones serán notificadas mediante la Plataforma y entrarán en vigor desde su
              publicación.</p>
          <ol>
              <li dir="auto"><strong>LEGISLACIÓN Y JURISDICCIÓN</strong></li>
          </ol>
          <p dir="auto">Estos Términos y Condiciones se regirán por las leyes de los Estados Unidos Mexicanos.</p>
          <p dir="auto">Cualquier controversia será sometida a la jurisdicción exclusiva de los tribunales competentes
              de la Ciudad de México, renunciando las partes a cualquier otro fuero que pudiera corresponderles.</p>
          <ol>
              <li dir="auto"><strong>CONTACTO</strong></li>
          </ol>
          <p dir="auto">Para cualquier duda relacionada con estos Términos y Condiciones:</p>
          <p dir="auto">Correo de soporte: &nbsp;</p>
          <p dir="auto">[<a data-tooltip-position="top" aria-label="mailto:soporte@pixkki.com" rel="noopener nofollow"
                            className="external-link" href="mailto:soporte@pixkki.com"
                            target="_blank">soporte@pixkki.com</a>]</p>
          <p dir="auto">Correo de privacidad: &nbsp;</p>
          <p dir="auto">[<a data-tooltip-position="top" aria-label="mailto:privacidad@pixkki.com"
                            rel="noopener nofollow" className="external-link" href="mailto:privacidad@pixkki.com"
                            target="_blank">privacidad@pixkki.com</a>]</p>

      </div>
        <Button
            onClick={goBack}
            className={"mt-10"}
        >
            ← Volver al inicio de sesión
        </Button>
    </div>
  );
}