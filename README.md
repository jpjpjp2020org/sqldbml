## Db schema design with .dbml for the course "SQL and PostgreSQL: The Complete Developer's Guide"

### References:

- Course link: [Udemy](https://www.udemy.com/course/sql-and-postgresql/)
- To visualize the design.dbml: [dbdiagram.io](https://dbdiagram.io/)

### Goals:

- Incrementally designing and planning a db for a theoretical photo sharing app (like IG).
- Optimizing the db
- Using the db for more complex SQL queries.

### Random notes and query examples:

- investigate query plan and measure efficiency with EXPLAIN ANALYZE:

    ```
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

    ```
    SELECT relname, relkind
    FROM pg_class
    WHERE relkind = 'i';
    ```

- Basic query tuning:

    - EXPLAIN and EXPLAIN ANALYZE in SQL or pgadmin internal tools for that with extra features
    - Stats for a table that postgres maintains:

        ```
        SELECT *
        FROM pg_stats
        WHERE tablename = 'users';
        ```
    - 