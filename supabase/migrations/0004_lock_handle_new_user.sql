-- Cierra el acceso a `handle_new_user` que dejó abierto 0003.
--
-- 0003 revocó los grants explícitos a `anon` y `authenticated`, pero la función
-- seguía siendo llamable: Postgres le da EXECUTE a PUBLIC a toda función nueva,
-- y esos dos roles lo heredaban por ahí. En la ACL se veía como el `=X/postgres`
-- inicial, sin rol delante.
--
-- Acá revocar sí es seguro, y por el motivo contrario al de los helpers de las
-- policies: a esta función nadie la invoca por nombre. La dispara el trigger
-- `on_auth_user_created`, que corre con el rol de `auth` y no pasa por la ACL.

revoke execute on function public.handle_new_user() from public;

-- home_country_average, friend_leaderboard y redeem_referral quedan como están:
-- son API pública a propósito y el cliente las llama por RPC.
