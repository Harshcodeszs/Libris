-- Install after docs/LBLMS_Neon_PostgreSQL_Schema.sql on a new database.
CREATE OR REPLACE FUNCTION public.create_book(p_title text, p_author text, p_category text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_book_id integer;
BEGIN
    IF NULLIF(btrim(p_title), '') IS NULL THEN
        RAISE EXCEPTION 'Title is required.';
    END IF;
    IF NULLIF(btrim(p_author), '') IS NULL THEN
        RAISE EXCEPTION 'Author is required.';
    END IF;
    IF NULLIF(btrim(p_category), '') IS NULL THEN
        RAISE EXCEPTION 'Category is required.';
    END IF;

    INSERT INTO public.book (title, author, category)
    VALUES (btrim(p_title), btrim(p_author), btrim(p_category))
    RETURNING book_id INTO v_book_id;

    RETURN v_book_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_book(p_book_id integer)
 RETURNS SETOF book
 LANGUAGE sql
 STABLE
AS $function$
    SELECT b.*
    FROM public.book AS b
    WHERE b.book_id = p_book_id
      AND b.deleted_at IS NULL;
$function$;

CREATE OR REPLACE FUNCTION public.get_books()
 RETURNS SETOF book
 LANGUAGE sql
AS $function$
    SELECT * FROM book
    WHERE deleted_at IS NULL;
$function$;

CREATE OR REPLACE FUNCTION public.set_book_status(p_book_id integer, p_status character varying)
 RETURNS book
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_book public.book%ROWTYPE;
BEGIN
    UPDATE public.book AS b
    SET status = p_status
    WHERE b.book_id = p_book_id
      AND b.deleted_at IS NULL
    RETURNING b.* INTO v_book;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active book copy not found.';
    END IF;

    RETURN v_book;
END;
$function$;

CREATE OR REPLACE FUNCTION public.soft_delete_book(p_book_id integer)
 RETURNS book
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_book public.book%ROWTYPE;
BEGIN
    UPDATE public.book AS b
    SET deleted_at = now()
    WHERE b.book_id = p_book_id
      AND b.deleted_at IS NULL
    RETURNING b.* INTO v_book;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active book copy not found.';
    END IF;

    RETURN v_book;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_book_details(p_book_id integer, p_title text, p_author text, p_category text)
 RETURNS book
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_book public.book%ROWTYPE;
BEGIN
    IF NULLIF(btrim(p_title), '') IS NULL THEN
        RAISE EXCEPTION 'Title is required.';
    END IF;
    IF NULLIF(btrim(p_author), '') IS NULL THEN
        RAISE EXCEPTION 'Author is required.';
    END IF;
    IF NULLIF(btrim(p_category), '') IS NULL THEN
        RAISE EXCEPTION 'Category is required.';
    END IF;

    UPDATE public.book AS b
    SET title = btrim(p_title),
        author = btrim(p_author),
        category = btrim(p_category)
    WHERE b.book_id = p_book_id
      AND b.deleted_at IS NULL
    RETURNING b.* INTO v_book;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active book copy not found.';
    END IF;

    RETURN v_book;
END;
$function$;
