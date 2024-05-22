import Layout from "../../components/Layout";
import { CurrentUserContext } from "../../contexts/CurrentUserContext";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useContext, useState } from "react";
import style from "../../styles/signup.module.css";
import Image from "next/image";
import emailPicture from "../../public/images/input_email.png";
import passwordPicture from "../../public/images/input_password.png";

export default function LoginPage({ csrfToken }) {
  const { currentUserProfile } = useContext(CurrentUserContext);
  const { query } = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(query.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      username: email,
      password,
    });

    if (result.error) {
      console.log("SignIn Error: ", result.error); // Log the error for debugging
      setError(result.error);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <Layout pageTitle={"Login"}>
      {currentUserProfile ? (
        <div className={style.mainContainerUserLogged}>
          <div className={style.containerTitle}>
            <p className={style.title}>
              Bienvenue {currentUserProfile.firstname}!
            </p>
          </div>
          <div className={style.containerInfos}>
            <p className={style.title}>Vos informations</p>
            <p>Prénom : {currentUserProfile.firstname} </p>
            <p>Nom : {currentUserProfile.lastname} </p>
            <p>Mail : {currentUserProfile.email} </p>
            <p>N° de tel : {currentUserProfile.phoneNumber} </p>
            <p>Adresse : {currentUserProfile.address} </p>
            <p>Société : {currentUserProfile.society}</p>
          </div>
          <button
            className={style.buttonSignOut}
            data-cy="disconnectBtn"
            onClick={() => signOut()}
          >
            Déconnexion
          </button>
        </div>
      ) : (
        <>
          <h1 className={style.mainTitle}>Identification :</h1>
          <form
            className={style.signUpForm}
            onSubmit={handleSubmit}
            data-cy="loginForm"
          >
            <input
              id="csrfToken"
              name="csrfToken"
              type="hidden"
              defaultValue={csrfToken}
            />
            <div className={style.inputDiv}>
              <label htmlFor="email">
                <Image src={emailPicture} alt="Email" />
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-cy="email"
              />
            </div>
            <div className={style.inputDiv}>
              <label htmlFor="password">
                <Image src={passwordPicture} alt="Mot de passe" />
              </label>
              <input
                name="password"
                type="password"
                id="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-cy="password"
              />
            </div>
            {error && (
              <p className={style.wrongDatas}>
                {error === "CredentialsSignin"
                  ? "Identifiants incorrects ! Merci de réessayer"
                  : "Erreur lors de la connexion. Merci de réessayer"}
              </p>
            )}
            <button data-cy="credentials-login-btn" type="submit">
              Se connecter
            </button>
            <h2 className={style.mainTitle}>Ou :</h2>
            <button type="button">
              <Link legacyBehavior href="/signup" passHref>
                S’inscrire
              </Link>
            </button>
            <button>
              <Link legacyBehavior href="/signup_invite" passHref>
                <a style={{ opacity: "0.4" }}>Continuer en tant qu’invité</a>
              </Link>
            </button>
          </form>
        </>
      )}
    </Layout>
  );
}

export async function getServerSideProps() {
  const csrfToken = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/csrf`)
    .then((res) => res.json())
    .then((data) => data.csrfToken);

  return {
    props: {
      csrfToken,
    },
  };
}
