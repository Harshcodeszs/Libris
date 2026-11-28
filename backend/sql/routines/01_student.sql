-- Install after docs/LBLMS_Neon_PostgreSQL_Schema.sql on a new database.
CREATE OR REPLACE FUNCTION public.create_student(p_account_id integer, p_first_name text, p_last_name text, p_contact_number text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_id INTEGER;
BEGIN
    INSERT INTO student (
        account_id, first_name,
        last_name, contact_number
    )
    VALUES (
        p_account_id, p_first_name,
        p_last_name, p_contact_number
    )
    RETURNING student_id INTO new_id;

    RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_student(p_student_id integer)
 RETURNS SETOF student
 LANGUAGE sql
 STABLE
AS $function$
    SELECT s.*
    FROM public.student AS s
    WHERE s.student_id = p_student_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_students()
 RETURNS SETOF student
 LANGUAGE sql
AS $function$
    SELECT * FROM student;
$function$;

CREATE OR REPLACE FUNCTION public.update_student_profile(p_student_id integer, p_first_name text, p_last_name text, p_contact_number text)
 RETURNS student
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_student public.student%ROWTYPE;
BEGIN
    IF p_first_name IS NULL OR btrim(p_first_name) = '' THEN
        RAISE EXCEPTION 'First name is required.';
    END IF;

    IF p_last_name IS NULL OR btrim(p_last_name) = '' THEN
        RAISE EXCEPTION 'Last name is required.';
    END IF;

    UPDATE public.student AS s
    SET first_name = btrim(p_first_name),
        last_name = btrim(p_last_name),
        contact_number = CASE
            WHEN p_contact_number IS NULL THEN NULL
            ELSE btrim(p_contact_number)
        END
    WHERE s.student_id = p_student_id
    RETURNING s.* INTO v_student;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student not found.';
    END IF;

    RETURN v_student;
END;
$function$;
