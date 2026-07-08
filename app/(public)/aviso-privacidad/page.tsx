"use client"
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

export default function PrivacidadPage() {
    const router = useRouter();
    const goBack = () => {
        router.back(); // Va a la página anterior en el historial
    };
  return (
      <div className="container mx-auto max-w-3xl py-10 px-4" >
          <div>
          <h1>AVISO DE PRIVACIDAD INTEGRAL</h1>
          <ol>
              <li dir="auto"><strong>RESPONSABLE DEL TRATAMIENTO DE DATOS PERSONALES</strong></li>
          </ol>
          <p dir="auto">Tecnología y Bienestar Digital Pixxki, S.A. de C.V. (en adelante, &#34;Pixkki&#34;), con domicilio en
              [DOMICILIO LEGAL], es responsable del tratamiento de los datos personales recabados a través de la
              plataforma Pixkki, de conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los
              Particulares y demás disposiciones aplicables en los Estados Unidos Mexicanos.</p>
          <p dir="auto">Para cualquier asunto relacionado con este Aviso de Privacidad, los titulares podrán comunicarse
              a través de:</p>
          <p dir="auto">Correo electrónico de privacidad: &nbsp;</p>
          <p dir="auto">[<a data-tooltip-position="top" aria-label="mailto:privacidad@pixkki.com"
                            rel="noopener nofollow" className="external-link" href="mailto:privacidad@pixkki.com"
                            target="_blank">privacidad@pixkki.com</a>]</p>
          <p dir="auto">Correo electrónico de soporte: &nbsp;</p>
          <p dir="auto">[<a data-tooltip-position="top" aria-label="mailto:soporte@pixkki.com" rel="noopener nofollow"
                            className="external-link" href="mailto:soporte@pixkki.com"
                            target="_blank">soporte@pixkki.com</a>]</p>
          <ol>
              <li dir="auto"><strong>DATOS PERSONALES QUE RECABAMOS</strong></li>
          </ol>
          <p dir="auto">Pixkki podrá recabar las siguientes categorías de datos personales:</p>
          <p dir="auto">2.1 Datos de usuarios internos de refugios &nbsp;</p>
          <p dir="auto">•Nombre completo. &nbsp;</p>
          <p dir="auto">• Correo electrónico. &nbsp;</p>
          <p dir="auto">• Contraseña cifrada. &nbsp;</p>
          <p dir="auto">• Cargo o rol dentro de la organización. &nbsp;</p>
          <p dir="auto">• Historial de acceso y actividad dentro de la plataforma.</p>
          <p dir="auto">2.2 Datos de adoptantes &nbsp;</p>
          <p dir="auto">•Nombre completo. &nbsp;</p>
          <p dir="auto">• Correo electrónico. &nbsp;</p>
          <p dir="auto">• Número telefónico. &nbsp;</p>
          <p dir="auto">• Dirección. &nbsp;</p>
          <p dir="auto">• Respuestas proporcionadas en formularios de adopción. &nbsp;</p>
          <p dir="auto">• Información relacionada con solicitudes de adopción.</p>
          <p dir="auto">2.3 Datos técnicos &nbsp;</p>
          <p dir="auto">•Dirección IP. &nbsp;</p>
          <p dir="auto">• Tipo de navegador. &nbsp;</p>
          <p dir="auto">• Sistema operativo. &nbsp;</p>
          <p dir="auto">• Fecha y hora de acceso. &nbsp;</p>
          <p dir="auto">• Identificadores de sesión. &nbsp;</p>
          <p dir="auto">• Registros de actividad y seguridad.</p>
          <ol>
              <li dir="auto"><strong>DATOS PERSONALES SENSIBLES</strong></li>
          </ol>
          <p dir="auto">Pixkki no solicita ni trata datos personales sensibles conforme a la legislación mexicana.</p>
          <p dir="auto">Los usuarios se comprometen a no registrar información sensible de personas dentro de los campos
              disponibles en la plataforma.</p>
          <ol>
              <li dir="auto"><strong>FINALIDADES DEL TRA &nbsp; &nbsp;TAMIENTO</strong></li>
          </ol>
          <p dir="auto">4.1 Finalidades primarias &nbsp;</p>
          <p dir="auto">Ls datos personales serán utilizados para:</p>
          <p dir="auto">• Crear y administrar cuentas de usuario. &nbsp;</p>
          <p dir="auto">• Autenticar accesos a la plataforma. &nbsp;</p>
          <p dir="auto">• Gestionar refugios y organizaciones registradas. &nbsp;</p>
          <p dir="auto">• Procesar solicitudes de adopción. &nbsp;</p>
          <p dir="auto">• Facilitar la comunicación entre refugios y adoptantes. &nbsp;</p>
          <p dir="auto">• Mantener expedientes relacionados con procesos de adopción. &nbsp;</p>
          <p dir="auto">• Brindar soporte técnico. &nbsp;</p>
          <p dir="auto">• Garantizar la seguridad de la plataforma. &nbsp;</p>
          <p dir="auto">• Cumplir obligaciones legales aplicables.</p>
          <p dir="auto">4.2 Finalidades secundarias &nbsp;</p>
          <p dir="auto">Aicionalmente, Pixkki podrá utilizar información no sensible para:</p>
          <p dir="auto">• Generar estadísticas de uso. &nbsp;</p>
          <p dir="auto">• Mejorar funcionalidades del sistema. &nbsp;</p>
          <p dir="auto">• Realizar análisis de experiencia de usuario. &nbsp;</p>
          <p dir="auto">• Elaborar reportes internos de desempeño. &nbsp;</p>
          <p dir="auto">• Desarrollar nuevas funcionalidades y servicios.</p>
          <p dir="auto">El titular podrá solicitar la limitación del uso de sus datos para finalidades secundarias
              mediante comunicación al correo de privacidad.</p>
          <ol>
              <li dir="auto"><strong>DATOS DE ANIMALES Y EXPEDIENTES</strong></li>
          </ol>
          <p dir="auto">La plataforma permite el almacenamiento de información relacionada con animales rescatados o
              disponibles para adopción.</p>
          <p dir="auto">Dicha información no constituye datos personales en términos de la legislación mexicana.</p>
          <p dir="auto">Los refugios son responsables de la veracidad, actualización y legalidad de los datos
              registrados respecto de los animales bajo su resguardo.</p>
          <ol>
              <li dir="auto"><strong>FOTOGRAFÍAS Y MATERIAL MULTIMEDIA</strong></li>
          </ol>
          <p dir="auto">Los refugios conservan la titularidad de las fotografías y demás materiales multimedia cargados
              en la plataforma.</p>
          <p dir="auto">Al utilizar Pixkki, el refugio otorga autorización para que dichas imágenes puedan ser
              utilizadas por Pixkki con fines de:</p>
          <p dir="auto">• Promoción institucional. &nbsp;</p>
          <p dir="auto">• Material informativo. &nbsp;</p>
          <p dir="auto">• Casos de éxito. &nbsp;</p>
          <p dir="auto">• Redes sociales. &nbsp;</p>
          <p dir="auto">• Presentaciones comerciales.</p>
          <p dir="auto">La autorización podrá revocarse mediante solicitud escrita enviada al correo de privacidad.</p>
          <ol>
              <li dir="auto"><strong>TRANSFERENCIAS DE DATOS</strong></li>
          </ol>
          <p dir="auto">Pixkki no vende ni comercializa datos personales.</p>
          <p dir="auto">Los datos podrán compartirse únicamente en los siguientes casos:</p>
          <p dir="auto">• Cuando exista obligación legal o requerimiento de autoridad competente. &nbsp;</p>
          <p dir="auto">• Con proveedores tecnológicos que apoyen la operación de la plataforma. &nbsp;</p>
          <p dir="auto">• Para servicios de alojamiento, almacenamiento, respaldo o seguridad informática. &nbsp;</p>
          <p dir="auto">• Cuando resulte necesario para la prestación de los servicios contratados.</p>
          <p dir="auto">En todos los casos se implementarán medidas razonables para proteger la información
              compartida.</p>
          <ol>
              <li dir="auto"><strong>MEDIDAS DE SEGURIDAD</strong></li>
          </ol>
          <p dir="auto">Pixkki implementa medidas administrativas, técnicas y organizativas razonables para proteger los
              datos personales contra:</p>
          <p dir="auto">• Acceso no autorizado. &nbsp;</p>
          <p dir="auto">• Alteración. &nbsp;</p>
          <p dir="auto">• Pérdida. &nbsp;</p>
          <p dir="auto">• Robo. &nbsp;</p>
          <p dir="auto">• Divulgación indebida. &nbsp;</p>
          <p dir="auto">• Uso ilícito.</p>
          <p dir="auto">No obstante, ningún sistema tecnológico puede garantizar seguridad absoluta.</p>
          <ol>
              <li dir="auto"><strong>DERECHOS ARCO</strong></li>
          </ol>
          <p dir="auto">Los titulares tienen derecho a:</p>
          <p dir="auto">• Acceder a sus datos personales. &nbsp;</p>
          <p dir="auto">• Rectificar información inexacta o incompleta. &nbsp;</p>
          <p dir="auto">• Cancelar sus datos cuando proceda legalmente. &nbsp;</p>
          <p dir="auto">• Oponerse al tratamiento de sus datos.</p>
          <p dir="auto">Para ejercer cualquiera de estos derechos deberá enviarse una solicitud al correo:</p>
          <p dir="auto">[<a data-tooltip-position="top" aria-label="mailto:privacidad@pixkki.com"
                            rel="noopener nofollow" className="external-link" href="mailto:privacidad@pixkki.com"
                            target="_blank">privacidad@pixkki.com</a>]</p>
          <p dir="auto">La solicitud deberá contener:</p>
          <p dir="auto">• Nombre completo del titular. &nbsp;</p>
          <p dir="auto">• Medio de contacto. &nbsp;</p>
          <p dir="auto">• Descripción clara de la solicitud. &nbsp;</p>
          <p dir="auto">• Documentación que permita acreditar identidad.</p>
          <p dir="auto">Pixkki responderá dentro de los plazos establecidos por la legislación aplicable.</p>
          <ol>
              <li dir="auto"><strong>REVOCACIÓN DEL CONSENTIMIENTO</strong></li>
          </ol>
          <p dir="auto">El titular podrá revocar en cualquier momento el consentimiento otorgado para el tratamiento de
              sus datos personales, siempre que dicha revocación no impida el cumplimiento de obligaciones legales o
              contractuales vigentes.</p>
          <ol>
              <li dir="auto"><strong>USO DE COOKIES Y TECNOLOGÍAS SIMILARES</strong></li>
          </ol>
          <p dir="auto">Pixkki podrá utilizar cookies, identificadores de sesión y tecnologías similares para:</p>
          <p dir="auto">• Mantener sesiones autenticadas. &nbsp;</p>
          <p dir="auto">• Mejorar la experiencia de navegación. &nbsp;</p>
          <p dir="auto">• Analizar el rendimiento de la plataforma. &nbsp;</p>
          <p dir="auto">• Detectar actividades sospechosas o fraudulentas.</p>
          <p dir="auto">Los usuarios podrán configurar su navegador para rechazar determinadas cookies; sin embargo,
              algunas funcionalidades podrían verse afectadas.</p>
          <ol>
              <li dir="auto"><strong>CONSERVACIÓN DE DATOS</strong></li>
          </ol>
          <p dir="auto">Los datos personales serán conservados durante el tiempo necesario para cumplir las finalidades
              descritas en este Aviso de Privacidad.</p>
          <p dir="auto">Cuando una organización solicite la baja definitiva de su cuenta:</p>
          <p dir="auto">• Podrá solicitar previamente la exportación de sus datos. &nbsp;</p>
          <p dir="auto">• La información permanecerá almacenada por un máximo de treinta (30) días naturales. &nbsp;</p>
          <p dir="auto">• Transcurrido dicho plazo, la información será eliminada de forma permanente, salvo obligación
              legal en contrario.</p>
          <ol>
              <li dir="auto"><strong>INTELIGENCIA ARTIFICIAL</strong></li>
          </ol>
          <p dir="auto">Pixkki podrá incorporar funcionalidades de inteligencia artificial para generar descripciones o
              recomendaciones relacionadas con animales disponibles para adopción.</p>
          <p dir="auto">Estas funcionalidades:</p>
          <p dir="auto">• Utilizarán exclusivamente información relacionada con los animales. &nbsp;</p>
          <p dir="auto">• No utilizarán datos personales de adoptantes para la generación de contenido. &nbsp;</p>
          <p dir="auto">• No sustituyen la revisión humana. &nbsp;</p>
          <p dir="auto">• Pueden generar errores, omisiones o interpretaciones incorrectas.</p>
          <p dir="auto">Las decisiones finales corresponderán siempre a los usuarios responsables del refugio.</p>
          <ol>
              <li dir="auto"><strong>LIMITACIÓN DE RESPONSABILIDAD</strong></li>
          </ol>
          <p dir="auto">Pixkki no será responsable por:</p>
          <p dir="auto">• Información incorrecta proporcionada por los usuarios. &nbsp;</p>
          <p dir="auto">• Decisiones de adopción tomadas por refugios. &nbsp;</p>
          <p dir="auto">• Diagnósticos veterinarios registrados en la plataforma. &nbsp;</p>
          <p dir="auto">• Ataques informáticos provenientes de terceros. &nbsp;</p>
          <p dir="auto">• Pérdida de información ocasionada por causas ajenas al control razonable de la
              empresa. &nbsp;</p>
          <p dir="auto">• Infracciones de derechos de autor cometidas por usuarios respecto de fotografías o contenidos
              cargados.</p>
          <ol>
              <li dir="auto"><strong>CAMBIOS AL AVISO DE PRIVACIDAD</strong></li>
          </ol>
          <p dir="auto">Pixkki podrá modificar este Aviso de Privacidad cuando resulte necesario para cumplir cambios
              legales, regulatorios, operativos o tecnológicos.</p>
          <p dir="auto">Las modificaciones serán publicadas dentro de la plataforma y entrarán en vigor a partir de su
              publicación.</p>
          <ol>
              <li dir="auto"><strong>LEGISLACIÓN APLICABLE</strong></li>
          </ol>
          <p dir="auto">Este Aviso de Privacidad se regirá por las leyes vigentes de los Estados Unidos Mexicanos.</p>
          <p dir="auto">Cualquier controversia relacionada con el tratamiento de datos personales será sometida a las
              autoridades y tribunales competentes de la Ciudad de México.</p>
          <ol>
              <li dir="auto"><strong>CONTACTO</strong></li>
          </ol>
          <p dir="auto">Para cualquier duda relacionada con este Aviso de Privacidad:</p>
          <p dir="auto">Correo de privacidad: &nbsp;</p>
          <p dir="auto">[<a data-tooltip-position="top" aria-label="mailto:privacidad@pixkki.com"
                            rel="noopener nofollow" className="external-link" href="mailto:privacidad@pixkki.com"
                            target="_blank">privacidad@pixkki.com</a>]</p>
          <p dir="auto">Correo de soporte: &nbsp;</p>
          <p dir="auto">[<a data-tooltip-position="top" aria-label="mailto:soporte@pixkki.com" rel="noopener nofollow"
                            className="external-link" href="mailto:soporte@pixkki.com"
                            target="_blank">soporte@pixkki.com</a>]</p>

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