-- Install after docs/LBLMS_Neon_PostgreSQL_Schema.sql on a new database.
CREATE OR REPLACE FUNCTION public.create_librarian(p_account_id integer, p_first_name text, p_last_name text, p_role character varying)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_id INTEGER;
BEGIN
    INSERT INTO librarian (
        account_id, first_name, last_name, role
    )
    VALUES (
        p_account_id, p_first_name,
        p_last_name, p_role
    )
    RETURNING librarian_id INTO new_id;

    RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_librarian(p_librarian_id integer)
 RETURNS SETOF librarian
 LANGUAGE sql
 STABLE
AS $function$
    SELECT l.*
    FROM public.librarian AS l
    WHERE l.librarian_id = p_librarian_id
      AND l.deleted_at IS NULL;
$function$;

CREATE OR REPLACE FUNCTION public.get_librarians()
 RETURNS SETOF librarian
 LANGUAGE sql
AS $function$
    SELECT * FROM librarian
    WHERE deleted_at IS NULL;
$function$;

CREATE OR REPLACE FUNCTION public.soft_delete_librarian(p_librarian_id integer)
 RETURNS librarian
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_librarian public.librarian%ROWTYPE;
BEGIN
    UPDATE public.librarian AS l
    SET deleted_at = now()
    WHERE l.librarian_id = p_librarian_id
      AND l.role = 'Librarian'
      AND l.deleted_at IS NULL
    RETURNING l.* INTO v_librarian;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active regular Librarian profile not found.';
    END IF;

    RETURN v_librarian;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_librarian_profile(p_librarian_id integer, p_first_name text, p_last_name text)
 RETURNS librarian
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_librarian public.librarian%ROWTYPE;
BEGIN
    IF NULLIF(btrim(p_first_name), '') IS NULL THEN
        RAISE EXCEPTION 'First name is required.';
    END IF;
    IF NULLIF(btrim(p_last_name), '') IS NULL THEN
        RAISE EXCEPTION 'Last name is required.';
    END IF;

    UPDATE public.librarian AS l
    SET first_name = btrim(p_first_name),
        last_name = btrim(p_last_name)
    WHERE l.librarian_id = p_librarian_id
      AND l.deleted_at IS NULL
    RETURNING l.* INTO v_librarian;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active staff profile not found.';
    END IF;

    RETURN v_librarian;
END;
$function$;
