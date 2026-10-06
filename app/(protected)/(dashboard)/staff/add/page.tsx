import AddStaffForm from "@/modules/users/components/AddStaffForm";

export default function NewStaffPage() {
    return (
        <main>
            <section>
                <h1>Agregar personal</h1>
                <p>
                    Registra un nuevo miembro del personal del refugio.
                </p>

                <AddStaffForm />
            </section>
        </main>
    );
}