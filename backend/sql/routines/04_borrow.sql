-- Install after docs/LBLMS_Neon_PostgreSQL_Schema.sql on a new database.
CREATE OR REPLACE FUNCTION public.approve_borrow_request(p_borrow_id integer, p_staff_id integer, p_approved_at timestamp with time zone, p_due_at timestamp with time zone)
 RETURNS borrow
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_borrow public.borrow%ROWTYPE;
BEGIN
    IF p_staff_id IS NULL
       OR p_approved_at IS NULL
       OR p_due_at IS NULL THEN
        RAISE EXCEPTION 'Staff ID, approval time, and due time are required.';
    END IF;

    UPDATE public.borrow AS b
    SET status = 'active',
        processed_by_id = p_staff_id,
        borrow_date = p_approved_at,
        approved_date = p_approved_at,
        due_date = p_due_at
    WHERE b.borrow_id = p_borrow_id
      AND b.status = 'pending'
    RETURNING b.* INTO v_borrow;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pending request not found.';
    END IF;

    RETURN v_borrow;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cancel_borrow_request(p_borrow_id integer, p_student_id integer)
 RETURNS borrow
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_borrow public.borrow%ROWTYPE;
BEGIN
    UPDATE public.borrow AS b
    SET status = 'cancelled',
        cancelled_date = now()
    WHERE b.borrow_id = p_borrow_id
      AND b.student_id = p_student_id
      AND b.status = 'pending'
    RETURNING b.* INTO v_borrow;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pending request not found for this student.';
    END IF;

    RETURN v_borrow;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_borrow(p_student_id integer, p_book_id integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_id INTEGER;
BEGIN
    INSERT INTO borrow (student_id, book_id)
    VALUES (p_student_id, p_book_id)
    RETURNING borrow_id INTO new_id;

    RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_borrow(p_borrow_id integer)
 RETURNS SETOF borrow
 LANGUAGE sql
 STABLE
AS $function$
    SELECT b.*
    FROM public.borrow AS b
    WHERE b.borrow_id = p_borrow_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_borrows()
 RETURNS SETOF borrow
 LANGUAGE sql
AS $function$
    SELECT * FROM borrow;
$function$;

CREATE OR REPLACE FUNCTION public.get_student_borrows(p_student_id integer)
 RETURNS SETOF borrow
 LANGUAGE sql
 STABLE
AS $function$
    SELECT b.*
    FROM public.borrow AS b
    WHERE b.student_id = p_student_id
    ORDER BY b.request_date DESC, b.borrow_id DESC;
$function$;

CREATE OR REPLACE FUNCTION public.issue_desk_borrow(p_student_id integer, p_book_id integer, p_staff_id integer, p_issued_at timestamp with time zone, p_due_at timestamp with time zone)
 RETURNS borrow
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_borrow public.borrow%ROWTYPE;
BEGIN
    IF p_student_id IS NULL OR p_book_id IS NULL
       OR p_staff_id IS NULL OR p_issued_at IS NULL
       OR p_due_at IS NULL THEN
        RAISE EXCEPTION 'Student, book, staff, issue time, and due time are required.';
    END IF;

    INSERT INTO public.borrow (
        student_id, book_id, processed_by_id, status,
        request_date, borrow_date, approved_date, due_date
    )
    VALUES (
        p_student_id, p_book_id, p_staff_id, 'active',
        p_issued_at, p_issued_at, p_issued_at, p_due_at
    )
    RETURNING * INTO v_borrow;

    RETURN v_borrow;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reject_borrow_request(p_borrow_id integer, p_staff_id integer, p_reason text)
 RETURNS borrow
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_borrow public.borrow%ROWTYPE;
BEGIN
    IF p_staff_id IS NULL THEN
        RAISE EXCEPTION 'Staff ID is required.';
    END IF;

    UPDATE public.borrow AS b
    SET status = 'rejected',
        processed_by_id = p_staff_id,
        rejected_date = now(),
        rejection_reason = NULLIF(btrim(p_reason), '')
    WHERE b.borrow_id = p_borrow_id
      AND b.status = 'pending'
    RETURNING b.* INTO v_borrow;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pending request not found.';
    END IF;

    RETURN v_borrow;
END;
$function$;

CREATE OR REPLACE FUNCTION public.return_borrow(p_borrow_id integer, p_returned_at timestamp with time zone)
 RETURNS borrow
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_borrow public.borrow%ROWTYPE;
BEGIN
    IF p_returned_at IS NULL THEN
        RAISE EXCEPTION 'Return time is required.';
    END IF;

    UPDATE public.borrow AS b
    SET status = 'returned',
        return_date = p_returned_at
    WHERE b.borrow_id = p_borrow_id
      AND b.status = 'active'
    RETURNING b.* INTO v_borrow;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active loan not found.';
    END IF;

    RETURN v_borrow;
END;
$function$;
