<template>
  <table>
    <tr>
      <!-- use the router-link component for navigation. -->
      <!-- specify the link by passing the `to` prop. -->
      <!-- `<router-link>` will render an `<a>` tag with the correct `href` attribute -->
      <td style="min-width:80px;border:30px"><router-link to="/">Home</router-link></td>
      <td style="min-width:80px;border:30px"><router-link to="/search">Search</router-link></td>
      <td style="min-width:80px;border:30px"><router-link to="/login">Login</router-link></td>
      <td style="min-width:80px;border:30px"><router-link to="/admin">Admin</router-link></td>
    </tr>
  </table>

  <!-- route outlet -->
  <!-- component matched by the route will render here -->
  <router-view></router-view>
</template>
