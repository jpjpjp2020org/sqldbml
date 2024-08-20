## Db schema design with .dbml for the course "SQL and PostgreSQL: The Complete Developer's Guide"

### References:

- Course link: [Udemy](https://www.udemy.com/course/sql-and-postgresql/)
- To visualize the design.dbml: [dbdiagram.io](https://dbdiagram.io/)

### Goals:

- Incrementally designing and planning a db for a theoretical photo sharing app (like IG).
- Optimizing the db
- Using the db for more complex SQL queries.

### Random notes:

- investigate query plan and measure efficiency with EXPLAIN ANALYZE:

    ```sql
    EXPLAIN ANALYZE SELECT *
    FROM users
    WHERE username = 'Emil30';
    ```

    "Execution Time: 0.363 ms" - without index

    "Execution Time: 0.039 ms" - with index generated (CREATE INDEX users_username_idx ON users (username);)

- Index downsides, especially in cloud hosting:
    - CAN BE LARGE! Stores data from at lest one column of the real table (~10% - 50+% extra storage).
    - SLOWS DOWN insert/update/delete - he index has to be updated.
    - Index might not actually get used by Postgres.

- Index types:

    - B-Tree - General purpose index - used most of the time.
    - Hash - Speedsup simple equality checks.
    - GiST (Generalized Search Tree) - Geometry, full-text search.
    - SP-GiST (Space-Partitioned Generalized Search Tree) - Clustered dta, such as dates - many rows might have the same year.
    - GIN (Generalized Inverted Index) - For columns that contain arrays or JSON data.
    - BRIN  (Block Range Index) - Specialized for really large datasets.

- Automatically generated indexes:

    - Postgres automatically creates an index for the primary key column for every table.
    - Same for any UNIQUE constraint.
    - *Not visible under indexes in pgadmin.

- Checking auto-generated indexes:

    ```sql
    SELECT relname, relkind
    FROM pg_class
    WHERE relkind = 'i';
    ```

- Basic query tuning:

    - EXPLAIN and EXPLAIN ANALYZE in SQL or pgadmin internal tools for that with extra features
    - Stats for a table that postgres maintains:

        ```sql
        SELECT *
        FROM pg_stats
        WHERE tablename = 'users';
        ```
    - Cost - roughly an amount of work/time to execute some part of a query plan.
        
        - Sequential load - reading data from consecutive blocks/pages - generally a little bit faster.

	    - Random load inconsecutive is generally slower.

	    - BUT -  inconsecutive smaller data load could reduce the total load by a lot and come up ahead vs loading all sequentially.

	    - https://www.postgresql.org/docs/current/runtime-config-query.html#RUNTIME-CONFIG-QUERY-CONSTANTS

        - seq_page_cost is the baseline and rest is roughly relative to that.

        - rough cost of a processing step in a query plan:

            ```
            COST = (#pages read sequentially) * seq_page_cost 
       		+ (# pages read at random) * random_page_cost 
       		+ (# rows scanned) * cpu_tuple_cost 
       		+ (# index entries scanned) * cpu_index_tuple_cost 
       		+ (# times function/operator evaluated) * cpu_operator_cost
            ```
    - Even if you set up an index, Postgres can decide not to use it "when not worth the trouble":

        ```sql
        EXPLAIN SELECT *
        FROM likes
        WHERE created_at < '2013-01-01';

        -- CREATE INDEX likes_created_at_idx ON likes (created_at);
        ```

        - After flipping the comparison, index is not used and sequential scan is done by Postgres instead:

        ```sql
        EXPLAIN SELECT *
        FROM likes
        WHERE created_at > '2013-01-01';
        ```

        - Worth to use EXPLAIN and establish if using storage space for an index will be worth it.
        - Not worth trying to get the index to be used.

### CTEs in the photo app db:

- EXPLAIN ANALYZE shows no meaningful difference in simple queries, but in complex ones the reusability for CTEs may come into play.
- CTEs open up recurisve logic in SQL too.
- Subquery approach - more verbose:

    ```sql
    SELECT users.username, tags.created_at
    FROM users
    JOIN (
        SELECT user_id, created_at FROM caption_tags
        UNION ALL
        SELECT user_id, created_at FROM photo_tags
    ) AS tags ON tags.user_id = users.id
    WHERE tags.created_at < '2010-01-07';
    ```

- CTE approach - cleaner and reusable (can then have a performance gain too in more complex queries):

    ```sql
    WITH tags AS (
        SELECT user_id, created_at FROM caption_tags
        UNION ALL
        SELECT user_id, created_at FROM photo_tags
    )
    SELECT users.username, tags.created_at
    FROM users
    JOIN tags ON tags.user_id = users.id
    WHERE tags.created_at < '2010-01-07';
    ```

### Views:

- DB design issue example - noticing the need to often UNION some existing tables.
- Could create a new combo table and copy data over / drop existing tables, but comes with issues:
    - Issues with copying over IDs which need to be unique.
    - Will break any existing queries refering to separate tables.
- Better solution would be to create a view (vs CTEs which are tied to a query, views can be crated beforehand and referred when needed).

    ```sql
    SELECT username, COUNT(*)
    FROM users
    JOIN (
        SELECT user_id, created_at FROM caption_tags
        UNION ALL
        SELECT user_id, created_at FROM photo_tags
    ) As tags ON tags.user_id = users.id
    GROUP BY users.username
    ORDER BY count(*) DESC;
    ```

    VS

    ```sql
    CREATE VIEW tags AS (
        SELECT id, created_at, user_id, post_id, 'photo_tag' AS type FROM photo_tags
        UNION ALL
        SELECT id, created_at, user_id, post_id, 'caption_tag' AS type FROM caption_tags
    );
    ```
- Can then simplify queries:

    ```sql
    SELECT username, COUNT(*)
    FROM users
    JOIN tags ON tags.user_id = users.id
    GROUP BY users.username
    ORDER BY count(*) DESC;
    ```

- Views are persistent objects and need to be dropped to lose them vs CTEs.
- If not materialized, not much storage consumption.
- Can edit by:
    ```sql
    CREATE OR REPLACE VIEW view_name AS ();
    ```

- Transactions 'aborted state' error fix after BEGIN when cannot COMMIT:
    -  Requires:

        ```sql
        ROLLBACK;
        ```

- Schema Migration Files:

    - Schema Migration Files: should always contain both Up and Down and migrations are better to be written out in plain SQL to avoid migration packages abstracting away the control over specific changes.
    - Best not to do Data migrations and Schema migrations at the same time.

- Connection pools:

    - A client can run 1 query at a time, so would use a connection pool which internally maintains several clients.
    - Exception being with transactions - would use a dedicated client to ensure consistency.
    - class-based pool initialization makes it easier to set up multiple pools with different configurations - easier to work with multiple DBs.
