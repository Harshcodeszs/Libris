-- Install after docs/LBLMS_Neon_PostgreSQL_Schema.sql on a new database.
CREATE OR REPLACE FUNCTION public.create_fine(p_borrow_id integer, p_student_id integer, p_amount numeric, p_reason character varying)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_id INTEGER;
BEGIN
    INSERT INTO fine (
        borrow_id, student_id, amount, reason
    )
    VALUES (
        p_borrow_id, p_student_id,
        p_amount, p_reason
    )
    RETURNING fine_id INTO new_id;

    RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_fine(p_fine_id integer)
 RETURNS SETOF fine
 LANGUAGE sql
 STABLE
AS $function$
    SELECT f.*
    FROM public.fine AS f
    WHERE f.fine_id = p_fine_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_fines()
 RETURNS SETOF fine
 LANGUAGE sql
AS $function$
    SELECT * FROM fine;
$function$;

CREATE OR REPLACE FUNCTION public.get_student_fines(p_student_id integer)
 RETURNS SETOF fine
 LANGUAGE sql
 STABLE
AS $function$
    SELECT f.*
    FROM public.fine AS f
    WHERE f.student_id = p_student_id
    ORDER BY f.issued_date DESC, f.fine_id DESC;
$function$;

CREATE OR REPLACE FUNCTION public.pay_fine(p_fine_id integer, p_staff_id integer, p_paid_on date)
 RETURNS fine
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_fine public.fine%ROWTYPE;
BEGIN
    IF p_staff_id IS NULL OR p_paid_on IS NULL THEN
        RAISE EXCEPTION 'Staff ID and payment date are required.';
    END IF;

    UPDATE public.fine AS f
    SET status = 'paid',
        paid_date = p_paid_on,
        waived_date = NULL,
        settled_by = p_staff_id
    WHERE f.fine_id = p_fine_id
      AND f.status = 'unpaid'
    RETURNING f.* INTO v_fine;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unpaid fine not found.';
    END IF;

    RETURN v_fine;
END;
$function$;

CREATE OR REPLACE FUNCTION public.waive_fine(p_fine_id integer, p_staff_id integer, p_waived_on date)
 RETURNS fine
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_fine public.fine%ROWTYPE;
BEGIN
    IF p_staff_id IS NULL OR p_waived_on IS NULL THEN
        RAISE EXCEPTION 'Staff ID and waiver date are required.';
    END IF;

    UPDATE public.fine AS f
    SET status = 'waived',
        paid_date = NULL,
        waived_date = p_waived_on,
        settled_by = p_staff_id
    WHERE f.fine_id = p_fine_id
      AND f.status = 'unpaid'
    RETURNING f.* INTO v_fine;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unpaid fine not found.';
    END IF;

    RETURN v_fine;
END;
$function$;
